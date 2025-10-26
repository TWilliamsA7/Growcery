"use client";

import GrowceryLogo from "@/components/GrowceryLogo";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  return (
    // Full screen, centered content, simple background
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4 text-center">
      {/* Logo as Hero */}
      <div className="mb-8 mt-[-10vh] sm:mt-0 flex justify-center w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <GrowceryLogo
          // We define the responsive container for the logo here.
          // w-full makes it take available width, aspect-square keeps its shape.
          // h-auto allows it to scale vertically based on width and aspect ratio.
          className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
          // These width/height are for next/image optimization, not direct CSS sizing
          width={1000}
          height={300}
          alt="Growcery App Logo"
        />
      </div>

      {/* Welcome Message (Optional) */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
        Welcome to Growcery!
      </h1>
      <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-prose">
        Manage your produce, track your crops, and reduce waste.
      </p>

      {/* Buttons for Login/Signup */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm justify-center">
        <Button
          onClick={() => router.push("/signup")}
          className="grow bg-green-600 hover:bg-green-700 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
        >
          Get Started (Sign Up)
        </Button>
        <Button
          onClick={() => router.push("/login")}
          className="grow bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
        >
          I Already Have an Account (Login)
        </Button>
      </div>
    </div>
  );
}
