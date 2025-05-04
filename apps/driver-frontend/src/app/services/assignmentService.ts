import { getServiceBaseUrl } from "@repo/service-discovery";

/**
 * Fetches driver assignments and enriches them with order details
 * with duplication prevention
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

    console.log(`Fetching driver assignments from: ${url.toString()}`);

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

    let assignments = await assignmentsResponse.json();
    console.log(`Raw assignments response:`, assignments);

    // Handle different API response formats
    if (assignments.assignments) {
      assignments = assignments.assignments;
    }

    if (
      !assignments ||
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      console.log("No assignments found");
      return [];
    }

    console.log(
      `Received ${assignments.length} assignments before deduplication`,
    );

    // THIS IS THE KEY FIX: Deduplicate assignments by orderId
    // Keep only the most recent assignment for each orderId
    const dedupedAssignmentsMap = new Map();

    for (const assignment of assignments) {
      // If this orderId hasn't been seen yet or this assignment is newer
      const existingAssignment = dedupedAssignmentsMap.get(assignment.orderId);

      if (
        !existingAssignment ||
        new Date(assignment.updatedAt) > new Date(existingAssignment.updatedAt)
      ) {
        dedupedAssignmentsMap.set(assignment.orderId, assignment);
      }
    }

    // Convert back to array after deduplication
    const dedupedAssignments = Array.from(dedupedAssignmentsMap.values());
    console.log(
      `After deduplication: ${dedupedAssignments.length} assignments`,
    );

    // Step 2: Extract order IDs and fetch order details from deduped assignments
    const orderIds = dedupedAssignments.map((assignment) => assignment.orderId);

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
      return dedupedAssignments; // Return deduped assignments without order details
    }

    const orderDetails = await orderDetailsResponse.json();
    console.log(`Received details for ${orderDetails.length} orders`);

    // Step 3: Combine the data
    const enrichedAssignments = dedupedAssignments.map((assignment) => {
      const matchingOrder = orderDetails.find(
        (order: { id: string }) => order.id === assignment.orderId,
      );

      return {
        ...assignment,
        orderDetails: matchingOrder || null,
      };
    });

    console.log(
      `Returning ${enrichedAssignments.length} enriched and deduplicated assignments`,
    );
    return enrichedAssignments;
  } catch (error) {
    console.error("Error fetching enriched assignments:", error);
    return [];
  }
}
