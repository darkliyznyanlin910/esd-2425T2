"use client";

import React, { useEffect, useState } from "react";
import { hc } from "hono/client";
import { MapPin, Package } from "lucide-react";
import { z } from "zod";

import type { AppType } from "@repo/order/type";
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

export function DeliveryForm() {
  const [step, setStep] = useState(1);
  const [isPolling, setIsPolling] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
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

  console.log(name);

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

      if (response.ok) {
        const orderData = await response.json();
        setOrderId(orderData.id);
        setIsPolling(true);
        form.reset();
      } else {
        alert("Failed to create order.");
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
          `${getServiceBaseUrl("order")}/payment/order/${orderId}`,
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
        if (data && data.status === "open") {
          setIsPolling(false);
          clearInterval(interval);
          if (data.sessionUrl) {
            window.location.href = data.sessionUrl;
          } else {
            alert("Session URL not found.");
          }
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
    <div className="mx-auto w-full max-w-3xl">
      {isPolling && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-accent p-6 text-center shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
            <p className="mb-2 text-lg font-medium">
              Redirecting to payment page...
            </p>
            <p className="text-sm">Please do not close this window.</p>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Local Delivery</h2>
        <p className="text-muted-foreground">
          Fill in the details to schedule your delivery
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              1
            </div>
            <span className="mt-2 text-xs">Package Details</span>
          </div>
          <div
            className={`mx-2 h-1 flex-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
          ></div>
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              2
            </div>
            <span className="mt-2 text-xs">Addresses</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={
            step !== 2
              ? (e) => {
                  e.preventDefault();
                  setStep(2);
                  setTimeout(() => {
                    const formElement =
                      document.getElementById("delivery-form");
                    if (formElement) {
                      formElement.scrollIntoView({ behavior: "smooth" });
                    }
                  }, 100);
                }
              : form.handleSubmit(onSubmit)
          }
          id="delivery-form"
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Package Information</h3>
                </div>
                <div className="space-y-2">
                  <FormField
                    name="orderDetails"
                    control={form.control}
                    render={({ field }) => (
                      <>
                        <FormLabel htmlFor="orderDetails">
                          Package Description
                        </FormLabel>
                        <FormControl>
                          <textarea
                            id="orderDetails"
                            {...field}
                            placeholder="Briefly describe the contents of your package"
                            className="min-h-[150px] w-full rounded-md border border-gray-300 p-2"
                            required
                          />
                        </FormControl>
                      </>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Continue to Addresses
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">
                    Pickup & Delivery Addresses
                  </h3>
                </div>
                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium">Pickup Address</h4>
                  <div className="space-y-2">
                    <FormField
                      name="fromAddressLine1"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="fromAddressLine1">
                            Address Line 1
                          </FormLabel>
                          <FormControl>
                            <input
                              id="fromAddressLine1"
                              {...field}
                              type="text"
                              placeholder="Street address"
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                              required
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      name="fromAddressLine2"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="fromAddressLine2">
                            Address Line 2 (Optional)
                          </FormLabel>
                          <FormControl>
                            <input
                              id="fromAddressLine2"
                              {...field}
                              type="text"
                              placeholder="Apartment, suite, unit, etc."
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <FormField
                        name="fromCity"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="fromCity">City</FormLabel>
                            <FormControl>
                              <input
                                id="fromCity"
                                {...field}
                                type="text"
                                placeholder="City"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                                required
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        name="fromState"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="fromState">
                              State/Province
                            </FormLabel>
                            <FormControl>
                              <input
                                id="fromState"
                                {...field}
                                type="text"
                                placeholder="State/Province"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        name="fromZipCode"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="fromZipCode">
                              Postal Code
                            </FormLabel>
                            <FormControl>
                              <input
                                id="fromZipCode"
                                {...field}
                                type="text"
                                placeholder="Postal code"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                                required
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormField
                      name="fromCountry"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="fromCountry">Country</FormLabel>
                          <FormControl>
                            <input
                              id="fromCountry"
                              {...field}
                              type="text"
                              placeholder="Country"
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                              required
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium">Delivery Address</h4>
                  <div className="space-y-2">
                    <FormField
                      name="toAddressLine1"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="toAddressLine1">
                            Address Line 1
                          </FormLabel>
                          <FormControl>
                            <input
                              id="toAddressLine1"
                              {...field}
                              type="text"
                              placeholder="Street address"
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                              required
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      name="toAddressLine2"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="toAddressLine2">
                            Address Line 2 (Optional)
                          </FormLabel>
                          <FormControl>
                            <input
                              id="toAddressLine2"
                              {...field}
                              type="text"
                              placeholder="Apartment, suite, unit, etc."
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <FormField
                        name="toCity"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="toCity">City</FormLabel>
                            <FormControl>
                              <input
                                id="toCity"
                                {...field}
                                type="text"
                                placeholder="City"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                                required
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        name="toState"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="toState">
                              State/Province
                            </FormLabel>
                            <FormControl>
                              <input
                                id="toState"
                                {...field}
                                type="text"
                                placeholder="State/Province"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <FormField
                        name="toZipCode"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <FormLabel htmlFor="toZipCode">
                              Postal Code
                            </FormLabel>
                            <FormControl>
                              <input
                                id="toZipCode"
                                {...field}
                                type="text"
                                placeholder="Postal code"
                                className="h-12 w-full rounded-md border border-gray-300 p-2"
                                required
                              />
                            </FormControl>
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FormField
                      name="toCountry"
                      control={form.control}
                      render={({ field }) => (
                        <>
                          <FormLabel htmlFor="toCountry">Country</FormLabel>
                          <FormControl>
                            <input
                              id="toCountry"
                              {...field}
                              type="text"
                              placeholder="Country"
                              className="h-12 w-full rounded-md border border-gray-300 p-2"
                              required
                            />
                          </FormControl>
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Proceed to Payment
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
