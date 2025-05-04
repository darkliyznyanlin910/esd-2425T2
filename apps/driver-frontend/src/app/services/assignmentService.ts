import { getServiceBaseUrl } from "@repo/service-discovery";

// Enhanced types that match expected data in deliveryHistory.tsx
interface Assignment {
  id: string;
  orderId: string;
  driverId: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface OrderDetails {
  id: string;
  description?: string;
  status?: string;
  pickupAddress?: string;
  pickupPostalCode?: string;
  deliveryAddress?: string;
  deliveryPostalCode?: string;
  createdAt?: string;
  updatedAt?: string;
  pickupContact?: string;
  deliveryContact?: string;
  notes?: string;
  packageSize?: string;
  packageWeight?: string;
  [key: string]: any;
}

interface EnrichedAssignment extends Assignment {
  orderDetails: OrderDetails | null;
}

type AssignmentsResponse =
  | Assignment[]
  | { assignments: Assignment[] }
  | { success: boolean; assignments: Assignment[] };

/**
 * Fetches driver assignments and enriches them with order details
 * with duplication prevention and better validation
 */
export async function getEnrichedDriverAssignments(
  userId: string,
  status?: string,
): Promise<EnrichedAssignment[]> {
  try {
    console.log(
      `Starting assignment fetch for user ${userId} with status filter: ${status || "none"}`,
    );

    // Step 1: Get the driver assignments
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
        `Failed to fetch driver assignments: ${assignmentsResponse.status}`,
        await assignmentsResponse
          .text()
          .catch(() => "Could not read response text"),
      );
      return [];
    }

    // Step 2: Parse and normalize assignment data
    const responseData = await assignmentsResponse.json();
    console.log(
      `Raw assignments response type: ${typeof responseData}, isArray: ${Array.isArray(responseData)}`,
    );

    // Inspect the first item for debugging
    if (Array.isArray(responseData) && responseData.length > 0) {
      console.log(
        `First assignment item structure:`,
        Object.keys(responseData[0]).reduce(
          (acc, key) => ({
            ...acc,
            [key]: typeof responseData[0][key],
          }),
          {},
        ),
      );
    } else if (responseData?.assignments?.length > 0) {
      console.log(
        `First assignment item structure:`,
        Object.keys(responseData.assignments[0]).reduce(
          (acc, key) => ({
            ...acc,
            [key]: typeof responseData.assignments[0][key],
          }),
          {},
        ),
      );
    }

    // Extract assignments array from response, handling different response formats
    let assignments: Assignment[] = [];

    if (Array.isArray(responseData)) {
      assignments = responseData;
    } else if (typeof responseData === "object" && responseData !== null) {
      if (
        "assignments" in responseData &&
        Array.isArray(responseData.assignments)
      ) {
        assignments = responseData.assignments;
      } else if (
        "success" in responseData &&
        "assignments" in responseData &&
        Array.isArray(responseData.assignments)
      ) {
        assignments = responseData.assignments;
      }
    }

    if (!Array.isArray(assignments)) {
      console.error(
        "Failed to extract assignments from response",
        responseData,
      );
      return [];
    }

    if (assignments.length === 0) {
      console.log("No assignments found");
      return [];
    }

    console.log(
      `Received ${assignments.length} assignments before deduplication`,
    );

    // Step 3: Validate assignment data structure
    const validatedAssignments = assignments.filter((assignment) => {
      if (!assignment.orderId) {
        console.warn("Found assignment without orderId:", assignment);
        return false;
      }
      return true;
    });

    if (validatedAssignments.length < assignments.length) {
      console.warn(
        `Filtered out ${assignments.length - validatedAssignments.length} invalid assignments`,
      );
    }

    // Step 4: Deduplicate assignments by orderId
    const dedupedAssignmentsMap = new Map<string, Assignment>();

    for (const assignment of validatedAssignments) {
      const existingAssignment = dedupedAssignmentsMap.get(assignment.orderId);

      if (
        !existingAssignment ||
        new Date(assignment.updatedAt) > new Date(existingAssignment.updatedAt)
      ) {
        dedupedAssignmentsMap.set(assignment.orderId, assignment);
      }
    }

    const dedupedAssignments = Array.from(dedupedAssignmentsMap.values());
    console.log(
      `After deduplication: ${dedupedAssignments.length} assignments`,
    );

    // Step 5: Fetch order details for deduplicated assignments
    const orderIds = dedupedAssignments.map((assignment) => assignment.orderId);
    console.log(
      `Fetching details for ${orderIds.length} unique orders:`,
      orderIds,
    );

    if (orderIds.length === 0) {
      return [];
    }

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
        `Failed to fetch order details: ${orderDetailsResponse.status}`,
        await orderDetailsResponse
          .text()
          .catch(() => "Could not read response text"),
      );
      // Return assignments without order details
      return dedupedAssignments.map((assignment) => ({
        ...assignment,
        orderDetails: null,
      }));
    }

    // Step 6: Process and merge order details
    const orderDetails = await orderDetailsResponse.json();

    if (!Array.isArray(orderDetails)) {
      console.error(
        "Expected array of order details but received:",
        typeof orderDetails,
      );
      return dedupedAssignments.map((assignment) => ({
        ...assignment,
        orderDetails: null,
      }));
    }

    console.log(`Received details for ${orderDetails.length} orders`);

    // Add debug log to see structure of first order
    if (orderDetails.length > 0) {
      console.log(
        `First order details structure:`,
        Object.keys(orderDetails[0]).reduce(
          (acc, key) => ({
            ...acc,
            [key]: typeof orderDetails[0][key],
          }),
          {},
        ),
      );
    }

    // Step 7: Combine the data with field validation
    const enrichedAssignments = dedupedAssignments.map((assignment) => {
      const matchingOrder = orderDetails.find(
        (order) => order.id === assignment.orderId,
      );

      // Validate order fields match expected structure
      let normalizedOrderDetails: OrderDetails | null = null;

      if (matchingOrder) {
        normalizedOrderDetails = {
          id: matchingOrder.id || "",
          description: matchingOrder.description || matchingOrder.notes || "",
          status: matchingOrder.status || assignment.orderStatus,
          pickupAddress:
            matchingOrder.pickupAddress || matchingOrder.fromAddress || "",
          pickupPostalCode:
            matchingOrder.pickupPostalCode ||
            matchingOrder.fromPostalCode ||
            "",
          deliveryAddress:
            matchingOrder.deliveryAddress || matchingOrder.toAddress || "",
          deliveryPostalCode:
            matchingOrder.deliveryPostalCode ||
            matchingOrder.toPostalCode ||
            "",
          createdAt: matchingOrder.createdAt || assignment.createdAt || "",
          updatedAt: matchingOrder.updatedAt || assignment.updatedAt || "",
          pickupContact:
            matchingOrder.pickupContact || matchingOrder.senderContact || "",
          deliveryContact:
            matchingOrder.deliveryContact ||
            matchingOrder.recipientContact ||
            "",
          notes: matchingOrder.notes || "",
          packageSize: matchingOrder.packageSize || matchingOrder.size || "",
          packageWeight:
            matchingOrder.packageWeight || matchingOrder.weight || "",
        };
      }

      return {
        ...assignment,
        orderDetails: normalizedOrderDetails,
      };
    });

    console.log(
      `Returning ${enrichedAssignments.length} enriched and deduplicated assignments`,
    );

    // Log first item to verify structure
    if (enrichedAssignments.length > 0) {
      const firstAssignment = enrichedAssignments[0];
      if (firstAssignment) {
        console.log("First enriched assignment:", {
          id: firstAssignment.id,
          orderId: firstAssignment.orderId,
          orderStatus: firstAssignment.orderStatus,
          hasOrderDetails: firstAssignment.orderDetails !== null,
        });
      }
    }

    return enrichedAssignments;
  } catch (error) {
    console.error("Error fetching enriched assignments:", error);
    return [];
  }
}
