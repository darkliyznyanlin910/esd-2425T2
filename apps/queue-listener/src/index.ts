import "dotenv/config";

import { MessageRouter } from "@repo/queue-processor";

import { env } from "./env";
import { RabbitMQListener } from "./utils/listener";

async function main() {
  // Initialize and start listeners
  if (
    env.DEPLOYMENT_ENVIRONMENT === "docker" ||
    env.DEPLOYMENT_ENVIRONMENT === "local"
  ) {
    const rabbitUrl = env.RABBITMQ_URL!;
    const rabbitQueue = env.RABBITMQ_QUEUE!;
    const rabbitUsername = env.RABBITMQ_USERNAME!;
    const rabbitPassword = env.RABBITMQ_PASSWORD!;
    const rabbitListener = new RabbitMQListener(
      rabbitUrl,
      rabbitQueue,
      rabbitUsername,
      rabbitPassword,
    );
    await rabbitListener.listen(MessageRouter);
    process.on("SIGTERM", async () => {
      await rabbitListener.stop();
      process.exit(0);
    });
  }
}

main().catch((error) => {
  console.error("Failed to start queue listeners:", error);
  process.exit(1);
});
