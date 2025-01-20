import { QueueMessage } from "../types/message";

export const MessageRouter = async (message: QueueMessage) => {
  console.log("Received message:", message);
  // Process your message here
};
