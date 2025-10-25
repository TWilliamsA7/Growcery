"use client";

import { CropTable } from "@/components/CropTable";
import GrowceryLogo from "@/components/GrowceryLogo";
import LogOutButton from "@/components/LogOutButton";
import MobileButton from "@/components/MobileButton";
import { ProduceTable } from "@/components/ProduceTable";
import { SelectRoleModal } from "@/components/SelectRoleModal";
import { useProfile } from "@/contexts/profile-provider";

export default function HomePage() {
  const { profile } = useProfile();

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
        <MobileButton>Start Scan</MobileButton>

        {profile?.user_type === "consumer" ? (
          <>
            <ProduceTable expired className="my-1" />
            <ProduceTable limit={5} className="my-1" />
          </>
        ) : (
          <>
            <CropTable past_harvest className="my-1" />
            <CropTable limit={5} className="my-1" />
          </>
        )}
      </main>
      <footer>
        <LogOutButton />
      </footer>
    </div>
  );
}
