"use client";

import React from "react";
import { z } from "zod";

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
      userId: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      const response = await fetch("http://localhost:3005/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: values, userId: values.userId }),
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
            <div className="grid grid-cols-[150px_1fr] gap-4 rounded-lg border bg-white p-6 shadow-md">
              <h3 className="col-span-2 mb-4 text-lg font-medium">
                From Address
              </h3>

              <FormField
                name="fromAddressLine1"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel className="pt-4">Address Line 1</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Address Line 2</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">City</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">State</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Zip Code</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Country</FormLabel>
                    <FormControl>
                      <input
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
            <div className="grid grid-cols-[150px_1fr] gap-4 rounded-lg border bg-white p-6 shadow-md">
              <h3 className="col-span-2 mb-4 text-lg font-medium">
                To Address
              </h3>
              <FormField
                name="toAddressLine1"
                control={form.control}
                render={({ field }) => (
                  <>
                    <FormLabel className="pt-4">Address Line 1</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Address Line 2</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">City</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">State</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Zip Code</FormLabel>
                    <FormControl>
                      <input
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
                    <FormLabel className="pt-4">Country</FormLabel>
                    <FormControl>
                      <input
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
