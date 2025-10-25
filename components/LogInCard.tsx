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
import { loginAction } from "@/lib/supabase/auth";
import { useState } from "react";

export function LoginCard() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async () => {
    if (!email || !password) {
      console.error("Please specify all required values!");
      return;
    }

    const succ: Boolean = await loginAction({
      email,
      password,
    });

    if (succ) {
      console.log("Account was successfully logged into!!!");
    } else {
      console.error("Something unexpected occurred!");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Log into your Account</CardTitle>
        <CardDescription>
          Enter your email below to log into your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={handleSubmit} className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}
