"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { useToast } from "@repo/ui/hooks/use-toast";

import { ProfileManagement } from "~/app/components/profile";

export interface DriverProfileData {
  id: string;
  phone: string;
  userId: string;
  availability: "AVAILABLE" | "ON_DELIVERY" | "OFFLINE";
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileData {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function Account() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [driverData, setDriverData] = useState<DriverProfileData | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/auth");
      return;
    }

    if (session.user.role === "client") {
      router.push(`${getServiceBaseUrl("customer-frontend")}/auth`);
      return;
    }

    if (session.user.role === "admin") {
      router.push(`${getServiceBaseUrl("admin-frontend")}/auth`);
      return;
    }

    fetchProfileData();
  }, [session, router]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch driver data
      const driverResponse = await fetch(
        `${getServiceBaseUrl("driver")}/driver/${session?.user.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!driverResponse.ok) {
        console.error(`Failed to fetch driver data: ${driverResponse.status}`);
        throw new Error(
          `Failed to fetch driver data: ${driverResponse.status}`,
        );
      }

      const driverData = await driverResponse.json();
      setDriverData(driverData);

      // Fetch user data for email
      const userResponse = await fetch(
        `${getServiceBaseUrl("auth")}/user/${session?.user.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!userResponse.ok) {
        console.error(`Failed to fetch user data: ${userResponse.status}`);
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile updates
  const updateProfile = async (
    field: "phone" | "email" | "password",
    value: string,
  ) => {
    try {
      let endpoint;
      let data;

      if (field === "phone") {
        endpoint = `${getServiceBaseUrl("driver")}/driver/${driverData?.id}`;
        data = { phone: value };
      } else {
        endpoint = `${getServiceBaseUrl("auth")}/user/${userData?.id}`;
        data = field === "email" ? { email: value } : { password: value };
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${field}: ${response.status}`);
      }

      // Refresh data after successful update
      fetchProfileData();

      toast({
        title: "Success",
        description: `Your ${field} has been updated successfully.`,
        variant: "success",
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Update Failed",
        description: `Failed to update your ${field}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (!driverData || !userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">
          Could not load profile data. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <ProfileManagement
      driverProfile={{
        driverId: driverData.id,
        phone: driverData.phone,
        email: userData.email,
        updatedAt: driverData.updatedAt,
      }}
      onUpdateProfile={updateProfile}
    />
  );
}
