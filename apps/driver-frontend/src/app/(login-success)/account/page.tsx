"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth/client";

export default function Account() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();

  const [driverData, setDriverData] = useState<any>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/auth");
    } else {
      fetchDriverData();
    }
  }, [session, router]);

  // Fetch Driver Data from database
  const fetchDriverData = async () => {
    try {
      const response = await fetch("http://localhost:3006/driver"); 
      const data = await response.json();
      setDriverData(data); 
    } catch (error) {
      console.error("Error fetching driver data:", error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <main className="flex-1 p-0">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Your Profile</h2>
          <div>
            {driverData.map((driver: any) => (
              <div key={driver.id} className="p-4 border-b">
                <p>Driver ID: {driver.userId}</p>
                <p>Phone Number: {driver.phone}</p>
                {/* <p>Status: {driver.availability}</p> */}
                <p>Joined on: {driver.createdAt}</p>
                <p>Profile updated on: {driver.updatedAt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
