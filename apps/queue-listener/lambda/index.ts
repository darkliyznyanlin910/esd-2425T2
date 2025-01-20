import { SQSHandler, SQSRecord } from "aws-lambda";

import { MessageRouter } from "../src/router";
import { QueueMessage } from "../src/types/message";

export const handler: SQSHandler = async (event) => {
  try {
    console.info(`Processing ${event.Records.length} messages`);

    const processPromises = event.Records.map(async (record: SQSRecord) => {
      try {
        const queueMessage: QueueMessage = {
          id: record.messageId,
          body: record.body,
          timestamp: Date.now(),
        };

        // Add your message processing logic here
        await MessageRouter(queueMessage);

        return {
          messageId: record.messageId,
          status: "success",
        };
      } catch (error) {
        console.error("Error processing message", {
          messageId: record.messageId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Throwing error will cause message to return to queue
        throw error;
      }
    });

    const results = await Promise.allSettled(processPromises);

    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.filter((r) => r.status === "fulfilled").length;

    console.info(
      `Processed ${succeeded} messages successfully, ${failed} failed`,
    );
  } catch (error) {
    console.error("Handler error", { error });
    throw error;
  }
};
