"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth-client";
import { HonoClient } from "@repo/auth/type";
import { getServiceBaseUrl } from "@repo/service-discovery";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

export default function AuthPage() {
  const router = useRouter();
  const { useSession, signIn } = authClient;
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      const res = await HonoClient.user.signup.$post(
        { json: { email, password, name } },
        { init: { credentials: "include" } },
      );
      const data = await res.json();
      console.log(data);
      setIsSignUp(!isSignUp);
    } else {
      await signIn.email({ email, password });
    }
  };
  useEffect(() => {
    if (session) {
      console.log(session);
      if (session.user.role === "client") {
        router.push("/dashboard");
      } else if (session.user.role === "admin") {
        window.location.href = `${getServiceBaseUrl("admin-frontend")}/order`;
      } else if (session.user.role === "driver") {
        window.location.href = `${getServiceBaseUrl("driver-frontend")}/home`;
      }
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
                      Username
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
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mt-4 w-full border-blue-950 text-sm text-blue-950 sm:text-base"
        >
          Back to Home Page
        </Button>
      </div>
    </div>
  );
}
