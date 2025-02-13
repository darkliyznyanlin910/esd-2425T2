import { NativeConnection, Worker } from "@temporalio/worker";

import * as activities from "@repo/temporal-activities";
import {
  getConnectionOptions,
  namespace,
  taskQueue,
} from "@repo/temporal-common";

async function run() {
  const connection = await NativeConnection.connect(getConnectionOptions());
  try {
    const worker = await Worker.create({
      workflowsPath: new URL("../../../temporal/workflows/src", import.meta.url)
        .pathname,
      activities,
      connection,
      namespace,
      taskQueue,
    });

    await worker.run();
  } finally {
    // Close the connection once the worker has stopped
    await connection.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
