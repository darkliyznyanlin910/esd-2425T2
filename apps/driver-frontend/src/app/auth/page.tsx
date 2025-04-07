"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { HonoClient } from "@repo/auth/type";
import { HonoClient as DriverHonoClient } from "@repo/driver/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

interface SignupResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  image: string | null;
}

export default function AuthPage() {
  const router = useRouter();
  const { useSession, signIn } = authClient;
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const res = await HonoClient.user.signup.$post(
        { json: { email, password, name } },
        { init: { credentials: "include" } },
      );

      const data: SignupResponse = (await res.json()) as SignupResponse;

      await DriverHonoClient.driver.$post({
        json: { phone, userId: data.id },
      });
      setIsSignUp(!isSignUp);
      console.log(data);
    } else {
      await signIn.email({ email, password });

      try {
        const updatedSession = await authClient.getSession();

        if (!updatedSession) {
          console.error("Session not found after sign-in.");
          return;
        }
        const response = await fetch(
          `${getServiceBaseUrl("driver")}/driver/${updatedSession.data?.user.id}/availability`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ availability: "AVAILABLE" }),
          },
        );
        console.log(updatedSession.data?.user.id);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error updating driver availability:", errorData);
          return;
        }

        const data = await response.json();
        console.log("Driver availability updated:", data);
      } catch (error) {
        console.error("Failed to update driver availability:", error);
      }
    }
  };

  useEffect(() => {
    if (session) {
      console.log(session);
      router.push("/home");
    }
  }, [session, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 text-white sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/auth-images/city-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex w-full max-w-lg flex-col items-center space-y-6 rounded-lg bg-white/80 p-6 text-center shadow-xl sm:max-w-md sm:p-8 md:max-w-lg md:p-10">
        <img
          src="/auth-images/vannova-icon.png"
          alt="VanNova Logo"
          className="w-30 sm:w-30 h-16 sm:h-20"
        />

        <h1 className="text-4xl font-bold text-blue-950 sm:text-5xl">
          VanNova
        </h1>

        <p className="sm:text-md max-w-md text-sm text-blue-950">
          Powering enterprise deliveries with speed and reliability.
        </p>

        <Card className="w-full bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-blue-950 sm:text-xl">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-blue-950">
              {isSignUp && (
                <>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="name" className="text-sm sm:text-base">
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="phone" className="text-sm sm:text-base">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="password" className="text-sm sm:text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>

              <Button type="submit" className="w-full text-sm sm:text-base">
                {isSignUp ? "Sign up" : "Sign in"}
              </Button>
            </form>

            <div
              onClick={() => setIsSignUp(!isSignUp)}
              className="mt-4 cursor-pointer text-center text-sm text-[#5f95d7] sm:text-base"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
