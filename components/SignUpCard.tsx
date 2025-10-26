// components/SignUpCard.tsx
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
import { signUpAction } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function SignUpCard() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  const handleSubmit = async () => {
    if (!email || !password || !firstName) {
      toast.error("Please enter your name, email, and password to sign up!");
      return;
    }

    const succ: Boolean = await signUpAction({
      email,
      first_name: firstName,
      last_name: lastName ?? null,
      password,
    });

    if (succ) {
      toast.success("Successful Account Creation! Redirecting...", {});
      router.push("/onboarding");
    } else {
      toast.error("Sign up failed. Please try a different email.");
      console.error("Something unexpected occurred!");
    }
  };

  return (
    // Styling for Card: full width on mobile, max-w-sm on desktop, shadow, border improvements
    <Card className="w-full max-w-sm shadow-2xl border-none sm:border">
      <CardHeader className="pt-8 pb-4">
        {/* LOGO INTEGRATION: Mobile-friendly branding */}
        <div className="flex justify-center mb-4">
          <GrowceryLogo
            width={320}
            height={80}
            alt="Growcery Logo"
            className="w-full h-16 max-w-[200px]"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Create Your Account
        </CardTitle>
        <CardDescription className="text-center">
          Join us today to start managing your produce efficiently.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {/* First Name & Last Name: Side-by-side on desktop, stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John (Required)"
                required
                className="h-10"
              />
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe (Optional)"
                className="h-10"
              />
            </div>
          </div>

          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10"
            />
          </div>

          {/* Password */}
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 shadow-lg transition-transform hover:scale-[1.01]"
        >
          Sign Up
        </Button>
        {/* Link to Login */}
        <p className="text-sm text-center text-gray-500">
          Already have an account?
          <a
            href="/login"
            className="text-green-600 hover:underline ml-1 font-medium"
          >
            Log In
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
