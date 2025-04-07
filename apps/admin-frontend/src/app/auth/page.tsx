"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { authClient } from "@repo/auth-client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { toast } from "@repo/ui/toast";

export default function AuthPage() {
  const router = useRouter();
  const { useSession, signIn } = authClient;
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (error !== "") {
      toast.error(error, {
        description: "Please check your credentials and try again.",
        duration: 10000,
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const usersession = await signIn.email({ email, password });

      if (usersession.error) {
        setError("Invalid email or password.");
        return;
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong.");
      return;
    }
  };

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.user.role === "admin") {
      router.push("/dashboard");
    } else {
      setError("Unauthorized access.");
      console.log(error);
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
              VanNova Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 text-blue-950">
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
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-xs text-gray-600">
          © 2025 VanNova. All rights reserved.
        </p>
      </div>
    </div>
  );
}
