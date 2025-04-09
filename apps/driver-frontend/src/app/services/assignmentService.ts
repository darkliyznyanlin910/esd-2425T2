import { getServiceBaseUrl } from "@repo/service-discovery";

/**
 * Fetches driver assignments and enriches them with order details
 */
export async function getEnrichedDriverAssignments(
  userId: string,
  status?: string,
) {
  // Step 1: Get the driver assignments
  try {
    const url = new URL(
      `${getServiceBaseUrl("driver")}/driver/assignments/${userId}`,
    );

    if (status) {
      url.searchParams.append("status", status);
    }

    const assignmentsResponse = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!assignmentsResponse.ok) {
      console.error(
        "Failed to fetch driver assignments",
        assignmentsResponse.status,
      );
      return [];
    }

    const assignments = await assignmentsResponse.json();

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Step 2: Extract order IDs and fetch order details
    const orderIds = assignments.map((assignment: any) => assignment.orderId);

    const orderDetailsResponse = await fetch(
      `${getServiceBaseUrl("order")}/order/bulk`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: orderIds }),
      },
    );

    if (!orderDetailsResponse.ok) {
      console.error(
        "Failed to fetch order details",
        orderDetailsResponse.status,
      );
      return assignments; // Return assignments without order details
    }

    const orderDetails = await orderDetailsResponse.json();

    // Step 3: Combine the data
    const enrichedAssignments = assignments.map((assignment: any) => {
      const matchingOrder = orderDetails.find(
        (order: any) => order.id === assignment.orderId,
      );

      return {
        ...assignment,
        orderDetails: matchingOrder || null,
      };
    });

    return enrichedAssignments;
  } catch (error) {
    console.error("Error fetching enriched assignments:", error);
    return [];
  }
}
