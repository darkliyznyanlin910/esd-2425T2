"use client";

import React, { useEffect, useState } from "react";
import { hc } from "hono/client";
import { z } from "zod";

import { AppType } from "@repo/order/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  useForm,
} from "@repo/ui/form";

const orderSchema = z.object({
  orderDetails: z.string().min(1, "Required"),
  fromAddressLine1: z.string().min(1, "Required"),
  fromAddressLine2: z.string().optional(),
  fromCity: z.string().min(1, "Required"),
  fromState: z.string().optional(),
  fromZipCode: z.string().min(1, "Required"),
  fromCountry: z.string().min(1, "Required"),
  toAddressLine1: z.string().min(1, "Required"),
  toAddressLine2: z.string().optional(),
  toCity: z.string().min(1, "Required"),
  toState: z.string().optional(),
  toZipCode: z.string().min(1, "Required"),
  toCountry: z.string().min(1, "Required"),
});

export default function CreateOrderPage() {
  const form = useForm({
    schema: orderSchema,
    defaultValues: {
      orderDetails: "",
      fromAddressLine1: "",
      fromAddressLine2: "",
      fromCity: "",
      fromState: "",
      fromZipCode: "",
      fromCountry: "",
      toAddressLine1: "",
      toAddressLine2: "",
      toCity: "",
      toState: "",
      toZipCode: "",
      toCountry: "",
    },
  });
  const [isPolling, setIsPolling] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      const response = await hc<AppType>(
        getServiceBaseUrl("order"),
      ).order.$post(
        {
          json: {
            order: values,
          },
        },
        {
          init: {
            credentials: "include",
          },
        },
      );
      console.log(response);
      if (response.ok) {
        alert("Order created successfully!");
        const orderData = await response.json();
        setOrderId(orderData.id);
        setIsPolling(true);
        form.reset();
      } else {
        alert("Failed to create order.");
        console.log(response);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred. Please try again.");
    }
  };
  useEffect(() => {
    if (!orderId || !isPolling) return;

    const fetchOrderStatus = async () => {
      try {
        const response = await fetch(
          `${getServiceBaseUrl("order")}/payment/${orderId}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          console.error("Failed to get payment information");
          return;
        }

        const data = await response.json();
        console.log("Payment Info:", data);

        if (data && data.status === "open") {
          setPaymentInfo(data);
          setPaymentStatus(data.status);
          setIsPolling(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    };

    const interval = setInterval(() => {
      fetchOrderStatus().catch(console.error);
    }, 5000);

    fetchOrderStatus().catch(console.error);

    return () => clearInterval(interval);
  }, [isPolling, orderId]);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-semibold">Create Order</h2>
      <Form {...form}>
        <form className="mb-5">
          <div className="grid gap-4 rounded-lg border bg-white p-5 shadow-md">
            <h3 className="text-lg font-medium">Order details</h3>
            <FormField
              name="orderDetails"
              control={form.control}
              render={({ field }) => (
                <>
                  <FormControl>
                    <input
                      id="orderDetails"
                      {...field}
                      type="text"
                      placeholder="Enter Your Order Details!"
                      className="h-12 w-full rounded-md border border-gray-300 p-2"
                    />
                  </FormControl>
                </>
              )}
            />
          </div>
        </form>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* From Address */}
            <div className="grid gap-4 rounded-lg border bg-white p-5 shadow-md">
              <h3 className="mb-4 text-lg font-medium md:col-span-2">
                From Address
              </h3>

              <FormField
                name="fromAddressLine1"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromAddressLine1" className="pt-4">
                      Address Line 1
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromAddressLine1"
                        {...field}
                        type="text"
                        placeholder="Address Line 1"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="fromAddressLine2"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromAddressLine2" className="pt-4">
                      Address Line 2
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromAddressLine2"
                        {...field}
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="fromCity"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromCity" className="pt-4">
                      City
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromCity"
                        {...field}
                        type="text"
                        placeholder="City"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="fromState"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromState" className="pt-4">
                      State
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromState"
                        {...field}
                        type="text"
                        placeholder="State (Optional)"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="fromZipCode"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromZipCode" className="pt-4">
                      Zip Code
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromZipCode"
                        {...field}
                        type="text"
                        placeholder="Zip Code"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="fromCountry"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="fromCountry" className="pt-4">
                      Country
                    </FormLabel>
                    <FormControl>
                      <input
                        id="fromCountry"
                        {...field}
                        type="text"
                        placeholder="Country"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />
            </div>

            {/* To Address */}
            <div className="grid gap-4 rounded-lg border bg-white p-5 shadow-md">
              <h3 className="mb-4 text-lg font-medium md:col-span-2">
                To Address
              </h3>
              <FormField
                name="toAddressLine1"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toAddressLine1" className="pt-4">
                      Address Line 1
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toAddressLine1"
                        {...field}
                        type="text"
                        placeholder="Address Line 1"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="toAddressLine2"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toAddressLine2" className="pt-4">
                      Address Line 2
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toAddressLine2"
                        {...field}
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="toCity"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toCity" className="pt-4">
                      City
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toCity"
                        {...field}
                        type="text"
                        placeholder="City"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="toState"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toState" className="pt-4">
                      State
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toState"
                        {...field}
                        type="text"
                        placeholder="State"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="toZipCode"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toZipCode" className="pt-4">
                      Zip Code
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toZipCode"
                        {...field}
                        type="text"
                        placeholder="Zip Code"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />

              <FormField
                name="toCountry"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel htmlFor="toCountry" className="pt-4">
                      Country
                    </FormLabel>
                    <FormControl>
                      <input
                        id="toCountry"
                        {...field}
                        type="text"
                        placeholder="Country"
                        className="h-12 w-full rounded-md border border-gray-300 p-2"
                      />
                    </FormControl>
                  </>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="blue"
            className="mt-4 w-full text-lg md:w-auto"
          >
            Submit Order
          </Button>
        </form>
      </Form>
    </div>
  );
}
