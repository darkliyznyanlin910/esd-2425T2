"use client";

import React from "react";
import { z } from "zod";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  useForm,
} from "@repo/ui/form";

const orderSchema = z.object({
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
  userId: z.string().min(1, "Required"),
});

const CreateOrder = () => {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const user_id = session?.user.id ?? "";

  const form = useForm({
    schema: orderSchema,
    defaultValues: {
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
      userId: user_id,
    },
  });

  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      const response = await fetch("http://localhost:3005/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: values, userId: user_id }),
      });

      if (response.ok) {
        alert("Order created successfully!");
        form.reset();
      } else {
        alert("Failed to create order.");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-semibold">Create Order</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* From Address */}
            <div className="grid gap-4 rounded-lg border bg-white p-6 shadow-md">
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
            <div className="grid gap-4 rounded-lg border bg-white p-6 shadow-md">
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
                        placeholder="State (Optional)"
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
};

export default CreateOrder;
