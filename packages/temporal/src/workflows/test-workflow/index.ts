import * as workflow from "@temporalio/workflow";

// Only import the activity types
import * as activities from "./activities";

const TASK_QUEUE_NAME = "test-workflow";

// Load Activities and assign the Retry Policy
const { getIP, getLocationInfo } = workflow.proxyActivities<typeof activities>({
  retry: {
    initialInterval: "1 second", // amount of time that must elapse before the first retry occurs.
    maximumInterval: "1 minute", // maximum interval between retries.
    backoffCoefficient: 2, // how much the retry interval increases.
    // maximumAttempts: 5, // maximum number of execution attempts. Unspecified means unlimited retries.
  },
  startToCloseTimeout: "1 minute", // maximum time allowed for a single Activity Task Execution.
});

async function getAddressFromIP(name: string): Promise<string> {
  try {
    const ip = await getIP();
    try {
      const location = await getLocationInfo(ip);
      return `Hello, ${name}. Your IP is ${ip} and your location is ${location}`;
    } catch (e) {
      throw new workflow.ApplicationFailure("Failed to get location");
    }
  } catch (e) {
    throw new workflow.ApplicationFailure("Failed to get IP");
  }
}

export { activities, TASK_QUEUE_NAME, getAddressFromIP };
