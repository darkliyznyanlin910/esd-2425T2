import { NativeConnection, Worker } from "@temporalio/worker";

import * as activities from "../workflows/test-workflow";

async function run() {
  const connection = await NativeConnection.connect({
    address: "localhost:7233",
  });
  try {
    const worker = await Worker.create({
      connection,
      namespace: "default",
      taskQueue: "test-workflow",
      workflowsPath: require.resolve("../workflows/index"),
      activities,
    });
    await worker.run();
  } finally {
    await connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
