import { useEffect, useState } from "react";
import { hc } from "hono/client";

import { Driver } from "@repo/db-driver/zod";
import { AppType } from "@repo/driver/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

const getDrivers = async () => {
  try {
    const response = await hc<AppType>(getServiceBaseUrl("driver")).driver.$get(
      {
        query: {},
      },
      {
        init: {
          credentials: "include",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch drivers");
    }

    const driverList = (await response.json()).map((driver: any) => ({
      ...driver,
      createdAt: new Date(driver.createdAt),
      updatedAt: new Date(driver.updatedAt),
    })) as Driver[];

    const availableDrivers = driverList.filter(
      (driver: Driver) => driver.availability === "AVAILABLE",
    );
    return availableDrivers;
  } catch (e) {
    console.error("Error fetching available drivers", e);
    return [];
  }
};

export function SelectionTable({
  orderId,
  paymentAmount,
  onAssign,
}: {
  orderId: string;
  paymentAmount: number;
  onAssign: (
    driverId: string,
    userId: string,
    orderId: string,
    paymentAmount: number,
  ) => void;
}) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedData = await getDrivers();
      setDrivers(fetchedData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Driver</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Assign</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {drivers.length > 0 ? (
          drivers.map((driver: Driver) => (
            <TableRow key={driver.id}>
              <TableCell>{driver.userId}</TableCell>
              <TableCell>{driver.availability}</TableCell>
              <TableCell>{driver.phone}</TableCell>
              <TableCell>
                <Button
                  onClick={async () => {
                    onAssign(driver.id, driver.userId, orderId, paymentAmount);
                  }}
                >
                  Assign
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
