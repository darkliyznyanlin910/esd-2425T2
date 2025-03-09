"use client";

import React from "react";

const OrderTable = () => {
  const orders = [
    { id: 1, item: "Laptop", quantity: 1, status: "Delivered" },
    { id: 2, item: "Phone", quantity: 2, status: "Processing" },
  ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Order History</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">Item</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border p-2">{order.id}</td>
              <td className="border p-2">{order.item}</td>
              <td className="border p-2">{order.quantity}</td>
              <td className="border p-2">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
