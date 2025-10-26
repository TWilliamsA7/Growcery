// app/page.tsx
"use client";

import CarrotLoader from "@/components/CarrotLoader";
import ChangeRolesButton from "@/components/ChangeRolesButton";
import { CropTable } from "@/components/CropTable";
import GrowceryLogo from "@/components/GrowceryLogo";
import LogOutButton from "@/components/LogOutButton";
import MobileButton from "@/components/MobileButton";
import { ProduceTable } from "@/components/ProduceTable";
import { SelectRoleModal } from "@/components/SelectRoleModal";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/profile-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  const [displayLimit, setDisplayLimit] = useState<number | undefined>(5);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

  function getTimeBasedGreeting(): string {
    const now = new Date();
    const hour = now.getHours();
    if (!profile) return "";

    if (hour >= 5 && hour < 12) {
      return `Good morning ${profile.first_name}!`;
    } else if (hour >= 12 && hour < 18) {
      return `Good afternoon ${profile.first_name}!`;
    } else {
      return `Good evening ${profile.first_name}!`;
    }
  }

  const handleModalClose = (open: Boolean) => {
    if (open === false) {
      toast("Thank you for your choice", {
        description: "It can be changed at any point later on",
      });

      setIsRoleModalOpen(false);
    }
  };

  const isConsumer = profile?.user_type === "consumer";
  const greetingText = getTimeBasedGreeting();

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* 🔝 HEADER: Dedicated to the large, bold logo banner */}
      <header
        className="w-full bg-green-700 dark:bg-gray-800 shadow-xl 
        flex justify-center items-center py-4 px-0"
      >
        {/* Logo Banner: Set to fill the width of its container */}
        <GrowceryLogo
          // *** FIX HERE: Use Tailwind classes for a wide, responsive banner ***
          // w-full makes it span the header width, h-24 gives it a bold height on mobile.
          width={1000} // Large arbitrary width for fill calculation
          height={150} // Aspect ratio hint (4:1)
          alt="Growcery Logo"
          // Ensure the container itself is wide and centered.
          className="w-full h-24 md:h-32 max-w-6xl"
        />
      </header>

      {/* 📜 MAIN CONTENT: Includes the greeting and the rest of the page */}
      <main className="grow p-4 space-y-6 max-w-4xl mx-auto w-full">
        {/* Greeting Text - Now placed prominently in the main section */}
        {greetingText && (
          <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {greetingText} 👋
            </h1>
          </div>
        )}

        {/* "Start Scan" Button - High priority CTA */}
        <MobileButton
          className="w-full h-24 text-3xl font-bold bg-green-600 hover:bg-green-700 text-white 
            shadow-xl rounded-2xl transition duration-150 ease-in-out transform hover:scale-[1.01]"
          onClick={() => router.push("/scan")}
        >
          Start Scan 📸
        </MobileButton>

        {/* Dynamic Tables Section (content remains the same) */}
        <section className="space-y-6">
          {/* 🔴 Expired/Past Harvest Table (Urgency Card) */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-red-500">
            <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400 border-b pb-2">
              {isConsumer
                ? "Expired Produce (Act Now)"
                : "Past Harvests (Review)"}
            </h2>
            {isConsumer ? (
              <ProduceTable expired className="my-1" />
            ) : (
              <CropTable past_harvest className="my-1" />
            )}
          </div>

          {/* 🔵 Current/Upcoming Produce/Crop Table (Main List Card) */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400 border-b pb-2">
              {isConsumer ? "Recent Produce" : "Current Crops"}
            </h2>
            {isConsumer ? (
              <ProduceTable limit={displayLimit} className="my-1" />
            ) : (
              <CropTable limit={displayLimit} className="my-1" />
            )}

            {/* See More/See Less Button for the main list */}
            <MobileButton
              className="w-full mt-4 text-base h-10 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 
                dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium"
              onClick={() => {
                setDisplayLimit((prev) => (prev ? undefined : 5));
              }}
            >
              {displayLimit ? "See All Items 👇" : "Show Less Items 👆"}
            </MobileButton>
          </div>
        </section>

        <CarrotLoader isActive={!!profileLoading} />
        <SelectRoleModal
          title="Change Roles"
          description="Update what role you find yourself in!"
          openDefault={false}
          open={isRoleModalOpen}
          onOpenChange={handleModalClose}
        />
      </main>

      {/* 🔽 FOOTER: Consistent for persistent actions */}
      <footer
        className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 
        flex justify-end items-center space-x-4 flex-col"
      >
        {/* Activate change roles button */}
        <ChangeRolesButton
          onClick={() => setIsRoleModalOpen(true)}
          className="text-lg font-medium text-white bg-orange-300 hover:bg-orange-500 transition duration-150"
        />

        {/* Log Out Button */}
        <LogOutButton className="text-lg font-medium text-white hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition duration-150" />
      </footer>
    </div>
  );
}
