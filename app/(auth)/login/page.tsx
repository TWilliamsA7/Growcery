"use client";

import { LoginCard } from "@/components/LogInCard";

export default function LoginPage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4
      bg-gray-50 dark:bg-gray-900 sm:bg-linear-to-br sm:from-green-50 sm:to-blue-50 dark:sm:from-gray-800"
    >
      <div className="w-full max-w-sm">
        <LoginCard />
      </div>
    </div>
  );
}
