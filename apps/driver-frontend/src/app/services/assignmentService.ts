import { getServiceBaseUrl } from "@repo/service-discovery";

/**
 * Fetches driver assignments and enriches them with order details
 */
export async function getEnrichedDriverAssignments(
  userId: string,
  status: string,
): Promise<any[]> {
  try {
    // Get driver ID from user ID
    const driverResponse = await fetch(
      `${getServiceBaseUrl("driver")}/driver/${userId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!driverResponse.ok) {
      throw new Error(`Failed to get driver: ${driverResponse.status}`);
    }

    const driver = await driverResponse.json();
    const driverId = driver.id;

    const url = new URL(
      `${getServiceBaseUrl("driver")}/driver/assignments/${userId}`,
    );
    if (status) {
      url.searchParams.append("status", status);
    }

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assignments: ${response.status}`);
    }

    const assignments = await response.json();

    // Track unique orderIds to prevent duplication
    const uniqueOrderIds = new Set();
    const uniqueAssignments = [];

    for (const assignment of Array.isArray(assignments) ? assignments : []) {
      if (!uniqueOrderIds.has(assignment.orderId)) {
        uniqueOrderIds.add(assignment.orderId);

        try {
          const orderResponse = await fetch(
            `${getServiceBaseUrl("order")}/order/${assignment.orderId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            uniqueAssignments.push({
              ...assignment,
              orderDetails: orderData,
            });
          }
        } catch (error) {
          console.error(
            `Error fetching order details for ${assignment.orderId}:`,
            error,
          );
        }
      }
    }

    return uniqueAssignments;
  } catch (error) {
    console.error("Error enriching driver assignments:", error);
    throw error;
  }
}
