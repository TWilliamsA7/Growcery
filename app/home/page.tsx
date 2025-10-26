"use client";

import { CropTable } from "@/components/CropTable";
import GrowceryLogo from "@/components/GrowceryLogo";
import LogOutButton from "@/components/LogOutButton";
import MobileButton from "@/components/MobileButton";
import { ProduceTable } from "@/components/ProduceTable";
import { SelectRoleModal } from "@/components/SelectRoleModal";
import { useProfile } from "@/contexts/profile-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const { profile } = useProfile();
  const router = useRouter();
  const [displayLimit, setDisplayLimit] = useState<number | undefined>(5);

  function getTimeBasedGreeting(): string {
    const now = new Date();
    const hour = now.getHours();
    if (!profile) return "";

    if (hour >= 5 && hour < 12) {
      return `Good morning ${profile.first_name}!`;
    } else if (hour >= 12 && hour < 18) {
      return `Good afternoon ${profile.first_name}!`;
    } else {
      // 6 PM (18) through 4:59 AM (4)
      return `Good evening ${profile.first_name}!`;
    }
  }

  return (
    <div>
      <header className="flex justify-center">
        <GrowceryLogo className="" size="xxxl" alt="Growcery Logo" />
        <h1 className="text-lg text-black">{getTimeBasedGreeting()}</h1>
      </header>
      <main>
        <MobileButton
          className="h-20 text-4xl"
          onClick={() => router.push("/scan")}
        >
          Start Scan
        </MobileButton>

        {profile?.user_type === "consumer" ? (
          <>
            <ProduceTable expired className="my-1" />
            <ProduceTable limit={displayLimit} className="my-1" />
          </>
        ) : (
          <>
            <CropTable past_harvest className="my-1" />
            <CropTable limit={displayLimit} className="my-1" />
          </>
        )}
        <MobileButton
          className="mb-3 text-2xl h-10"
          onClick={() => {
            if (displayLimit) {
              setDisplayLimit(undefined);
            } else {
              setDisplayLimit(5);
            }
          }}
        >
          {displayLimit ? "See More" : "See Less"}
        </MobileButton>
      </main>
      <footer>
        <LogOutButton className="text-lg" />
        {/* <SelectRoleModal
          title="Change Role"
          description="Flip between farmer and consumer"
          openDefault={false}
          triggerText="Change Role"
        /> */}
      </footer>
    </div>
  );
}
