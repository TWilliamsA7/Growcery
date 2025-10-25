// components/SignupForm.jsx
"use client";
import { SignUpCard } from "@/components/SignUpCard";
import { useUser } from "@/contexts/user-provider";

// <-- REQUIRED DIRECTIVE FOR CLIENT COMPONENTS

export default function SignupForm() {
  const { user } = useUser();

  return (
    <>
      <div className="max-w w-full min-h-screen space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <button
          onClick={() => {
            console.log("Current user:", user);
          }}
        >
          Test User
        </button>
        <SignUpCard />
      </div>
    </>
  );
}
