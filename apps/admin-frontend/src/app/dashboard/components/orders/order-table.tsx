"use client";

import { useEffect, useState } from "react";

import { Order } from "@repo/db-order/zod";

import { columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Order[]> {
  // Fetch data from API here.
  return [
    {
      id: "a1b2c3d4",
      displayId: "#0001",
      userId: "user-001",
      fromAddressLine1: "123 Main St",
      fromAddressLine2: "Springfield",
      fromZipCode: "12345",
      toAddressLine1: "789 Elm St",
      toAddressLine2: "Shelbyville",
      toZipCode: "67890",
      orderStatus: "PROCESSING",
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-02"),
    },
    {
      id: "e5f6g7h8",
      displayId: "#0002",
      userId: "user-002",
      fromAddressLine1: "456 Oak Ave",
      fromAddressLine2: "Riverside",
      fromZipCode: "54321",
      toAddressLine1: "321 Birch Rd",
      toAddressLine2: "Greendale",
      toZipCode: "98765",
      orderStatus: "FINDING_DRIVER",
      createdAt: new Date("2024-03-03"),
      updatedAt: new Date("2024-03-04"),
    },
    {
      id: "i9j0k1l2",
      displayId: "#0003",
      userId: "user-003",
      fromAddressLine1: "987 Pine St",
      fromAddressLine2: "Lakeside",
      fromZipCode: "11111",
      toAddressLine1: "654 Maple St",
      toAddressLine2: "Hilltop",
      toZipCode: "22222",
      orderStatus: "DELIVERED",
      createdAt: new Date("2024-02-28"),
      updatedAt: new Date("2024-03-01"),
    },
    {
      id: "m3n4o5p6",
      displayId: "#0004",
      userId: "user-004",
      fromAddressLine1: "159 Cedar Rd",
      fromAddressLine2: "Seaside",
      fromZipCode: "33333",
      toAddressLine1: "753 Walnut Ln",
      toAddressLine2: "Brookfield",
      toZipCode: "44444",
      orderStatus: "DELIVERED",
      createdAt: new Date("2024-02-25"),
      updatedAt: new Date("2024-02-26"),
    },
    {
      id: "q7r8s9t0",
      displayId: "#0005",
      userId: "user-005",
      fromAddressLine1: "852 Spruce St",
      fromAddressLine2: "Cliffside",
      fromZipCode: "55555",
      toAddressLine1: "159 Redwood Ave",
      toAddressLine2: "Valleyview",
      toZipCode: "66666",
      orderStatus: "PROCESSING",
      createdAt: new Date("2024-02-27"),
      updatedAt: new Date("2024-02-28"),
    },
    {
      id: "u1v2w3x4",
      displayId: "#0006",
      userId: "user-006",
      fromAddressLine1: "258 Aspen Dr",
      fromAddressLine2: "Meadowbrook",
      fromZipCode: "77777",
      toAddressLine1: "951 Chestnut Blvd",
      toAddressLine2: "Pinecrest",
      toZipCode: "88888",
      orderStatus: "DRIVER_FOUND",
      createdAt: new Date("2024-03-05"),
      updatedAt: new Date("2024-03-06"),
    },
    {
      id: "y5z6a7b8",
      displayId: "#0007",
      userId: "user-007",
      fromAddressLine1: "357 Fir St",
      fromAddressLine2: "Summit",
      fromZipCode: "99999",
      toAddressLine1: "468 Elmwood Dr",
      toAddressLine2: "Highland",
      toZipCode: "00000",
      orderStatus: "DELIVERED",
      createdAt: new Date("2024-03-07"),
      updatedAt: new Date("2024-03-08"),
    },
    {
      id: "c9d0e1f2",
      displayId: "#0008",
      userId: "user-008",
      fromAddressLine1: "654 Cypress Ct",
      fromAddressLine2: "Willowbrook",
      fromZipCode: "12121",
      toAddressLine1: "753 Poplar St",
      toAddressLine2: "Evergreen",
      toZipCode: "23232",
      orderStatus: "PROCESSING",
      createdAt: new Date("2024-03-09"),
      updatedAt: new Date("2024-03-10"),
    },
    {
      id: "g3h4i5j6",
      displayId: "#0009",
      userId: "user-009",
      fromAddressLine1: "951 Juniper Rd",
      fromAddressLine2: "Stonebridge",
      fromZipCode: "34343",
      toAddressLine1: "357 Willow Ave",
      toAddressLine2: "Lakewood",
      toZipCode: "45454",
      orderStatus: "PAYMENT_PENDING",
      createdAt: new Date("2024-03-11"),
      updatedAt: new Date("2024-03-12"),
    },
    {
      id: "k7l8m9n0",
      displayId: "#0010",
      userId: "user-010",
      fromAddressLine1: "852 Dogwood St",
      fromAddressLine2: "Crestwood",
      fromZipCode: "56565",
      toAddressLine1: "159 Mahogany Rd",
      toAddressLine2: "Woodland",
      toZipCode: "67676",
      orderStatus: "DELIVERED",
      createdAt: new Date("2024-03-13"),
      updatedAt: new Date("2024-03-14"),
    },
  ];
}

export default function OrderTablePage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getData();
      setData(fetchedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto h-screen py-6">
      <div className="text-xl font-semibold">Order Records</div>
      <DataTable columns={columns} data={data} />{" "}
    </div>
  );
}
