import amqp from "amqplib";

import { QueueMessage } from "@repo/queue-processor";

interface QueueListener {
  listen(callback: (message: QueueMessage) => Promise<void>): Promise<void>;
  stop(): Promise<void>;
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
