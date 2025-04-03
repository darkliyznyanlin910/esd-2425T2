import path from "path";
import { NativeConnection, Worker } from "@temporalio/worker";

import * as activities from "@repo/temporal-activities";
import { taskQueue } from "@repo/temporal-common";
import {
  getConnectionOptions,
  namespace,
} from "@repo/temporal-common/temporal-connection";

const workflowsPath = path.join(
  import.meta.url,
  "..",
  "..",
  "..",
  "..",
  "temporal",
  "workflows",
  "src",
);

async function run() {
  const connection = await NativeConnection.connect(getConnectionOptions());
  try {
    const worker = await Worker.create({
      workflowsPath: workflowsPath.replace("file:", ""),
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
