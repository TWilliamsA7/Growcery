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

  return (
    <div>
      <header>
        <GrowceryLogo className="" size="xxxxl" alt="Growcery Logo" />
        <SelectRoleModal
          title="Change Role"
          description="Flip between farmer and consumer"
          openDefault={false}
          triggerText="Change Role"
        />
      </header>
      <main>
        <MobileButton onClick={() => router.push("/scan")}>
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
          className="mb-3"
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
        <LogOutButton />
      </footer>
    </div>
  );
}
