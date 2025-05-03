import { getServiceBaseUrl } from "@repo/service-discovery";

// Define types for better type safety
interface Assignment {
  id: string;
  orderId: string;
  driverId: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // For other potential fields
}

interface OrderDetails {
  id: string;
  [key: string]: any; // For other order fields
}

interface EnrichedAssignment extends Assignment {
  orderDetails: OrderDetails | null;
}

type AssignmentsResponse = Assignment[] | { assignments: Assignment[] };

/**
 * Fetches driver assignments and enriches them with order details
 * with duplication prevention
 */
export async function getEnrichedDriverAssignments(
  userId: string,
  status?: string,
): Promise<EnrichedAssignment[]> {
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

    // Parse response as AssignmentsResponse type
    const responseData =
      (await assignmentsResponse.json()) as AssignmentsResponse;
    console.log(`Raw assignments response:`, responseData);

    // Extract assignments array from response, handling both formats
    let assignments: Assignment[] = [];

    if (Array.isArray(responseData)) {
      assignments = responseData;
    } else if (
      responseData &&
      typeof responseData === "object" &&
      "assignments" in responseData &&
      Array.isArray(responseData.assignments)
    ) {
      assignments = responseData.assignments;
    }

    if (assignments.length === 0) {
      console.log("No assignments found");
      return [];
    }

    console.log(
      `Received ${assignments.length} assignments before deduplication`,
    );

    // THIS IS THE KEY FIX: Deduplicate assignments by orderId
    // Keep only the most recent assignment for each orderId
    const dedupedAssignmentsMap = new Map<string, Assignment>();

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
      // Return assignments without order details
      return dedupedAssignments.map((assignment) => ({
        ...assignment,
        orderDetails: null,
      }));
    }

    const orderDetails = (await orderDetailsResponse.json()) as OrderDetails[];
    console.log(`Received details for ${orderDetails.length} orders`);

    // Step 3: Combine the data
    const enrichedAssignments = dedupedAssignments.map((assignment) => {
      const matchingOrder = orderDetails.find(
        (order) => order.id === assignment.orderId,
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
