"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@repo/auth/client";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";

export default function AuthPage() {
  const router = useRouter();
  const { useSession, signIn, signUp } = authClient;
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp.email({ email, password, name: "John Doe" });
    } else {
      await signIn.email({ email, password });
    }
  };
  useEffect(() => {
    if (session) {
      console.log(session);
      router.push("/order");
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

              <Button
                type="submit"
                variant="blue"
                className="w-full text-sm sm:text-base"
              >
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
