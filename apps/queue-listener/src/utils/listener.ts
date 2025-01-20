import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import amqp from "amqplib";

import { QueueMessage } from "../types/message";

interface QueueListener {
  listen(callback: (message: QueueMessage) => Promise<void>): Promise<void>;
  stop(): Promise<void>;
}

export class SQSListener implements QueueListener {
  private client: SQSClient;
  private queueUrl: string;
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(queueUrl: string, region = "us-east-1") {
    this.client = new SQSClient({ region });
    this.queueUrl = queueUrl;
  }

  async listen(
    callback: (message: QueueMessage) => Promise<void>,
  ): Promise<void> {
    this.isRunning = true;

    const pollMessages = async () => {
      if (!this.isRunning) return;

      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10,
      });

      try {
        const response = await this.client.send(command);
        if (response.Messages) {
          for (const message of response.Messages) {
            const queueMessage: QueueMessage = {
              id: message.MessageId!,
              body: message.Body!,
              timestamp: Date.now(),
            };

            await callback(queueMessage);

            // Delete message after successful processing
            await this.client.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          }
        }
      } catch (error) {
        console.error("Error processing SQS messages:", error);
      }
    };

    this.interval = setInterval(pollMessages, 10000);
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

export class RabbitMQListener implements QueueListener {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private queueName: string;
  private username: string;
  private password: string;
  private url: string;

  constructor(
    url: string,
    queueName: string,
    username: string,
    password: string,
  ) {
    this.url = url;
    this.queueName = queueName;
    this.username = username;
    this.password = password;
  }

  async listen(
    callback: (message: QueueMessage) => Promise<void>,
  ): Promise<void> {
    this.connection = await amqp.connect({
      username: this.username,
      password: this.password,
      hostname: this.url,
    });
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.queueName, { durable: true });

    await this.channel.consume(this.queueName, async (msg) => {
      if (msg) {
        const queueMessage: QueueMessage = {
          id: msg.properties.messageId || String(Date.now()),
          body: msg.content.toString(),
          timestamp: Date.now(),
        };

        try {
          await callback(queueMessage);
          this.channel?.ack(msg);
        } catch (error) {
          console.error("Error processing RabbitMQ message:", error);
          // Nack the message to requeue it
          this.channel?.nack(msg);
        }
      }
    });
  }

  async stop(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
