"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GrowceryLogo from "@/components/GrowceryLogo"; // Import the logo
import { loginAction } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    const succ: Boolean = await loginAction({
      email,
      password,
    });

    if (succ) {
      toast.success("Successful Login. Welcome Back! 👋", {});
      router.push("/home");
    } else {
      toast.error("Login failed. Please check your credentials.");
      console.error("Something unexpected occurred!");
    }
  };

  return (
    // Max-w-full on mobile, constrained to max-w-sm on larger screens.
    <Card className="w-full max-w-sm shadow-2xl border-none sm:border">
      <CardHeader className="pt-8 pb-4">
        {/* LOGO INTEGRATION */}
        <div className="flex justify-center mb-4">
          <GrowceryLogo
            width={320} // Adjusted for better visual size within the card
            height={80} // Maintaining a wide aspect ratio
            alt="Growcery Logo"
            className="w-full h-16 max-w-[200px]" // Mobile-first sizing: small and constrained
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Log into your Account
        </CardTitle>
        <CardDescription className="text-center">
          Welcome back! Enter your details to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10" // Explicit height for better touch target
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 pt-0">
        <Button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-6 shadow-lg transition-transform hover:scale-[1.01]"
        >
          Login
        </Button>
        {/* Placeholder for 'Forgot Password' or 'Sign Up Link' */}
        <p className="text-sm text-center text-gray-500">
          Don't have an account?
          <a
            href="/signup"
            className="text-blue-600 hover:underline ml-1 font-medium"
          >
            Sign Up
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
