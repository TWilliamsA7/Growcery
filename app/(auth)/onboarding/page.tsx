"use client";

import { LocationModal } from "@/components/LocationModal";
import { SelectRoleModal } from "@/components/SelectRoleModal";
import { useProfile } from "@/contexts/profile-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateUserLocation } = useProfile();
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
  const [selectRoleModalOpen, setSelectRoleModalOpen] = useState<boolean>(true);

  const handleExitSelectModal = (open: Boolean) => {
    if (open === false) {
      toast("Thank you for your choice", {
        description: "It can be changed at any point later on",
      });

      setSelectRoleModalOpen(false);
      setLocationModalOpen(true);
    }
  };

  const handleExitLocationModal = async (location: string) => {
    await updateUserLocation(location);

    toast("Thank you for you choices!", {
      description: "It can be changed at any point later on!",
    });

    router.push("/home");
  };

  return (
    <>
      <div
        className="min-h-screen w-full flex items-center justify-center 
                        bg-green-50 dark:bg-gray-900 
                        bg-linear-to-br from-green-50 to-blue-100 dark:to-gray-800"
      >
        {/* A subtle foreground element to indicate the user is in the app */}
        <div className="absolute top-0 left-0 p-4">
          {/* We could place a small logo here for persistent branding */}
          {/* <GrowceryLogo width={100} height={25} alt="Growcery" className="h-6 w-auto" /> */}
        </div>
        <LocationModal
          title="Select Location"
          description="Help us determine what climate you are in!"
          openDefault={false}
          open={locationModalOpen}
          onSubmit={handleExitLocationModal}
        />

        <SelectRoleModal
          title="Select Role"
          description="Will you be buying produce or harvesting crops?"
          openDefault={true}
          open={selectRoleModalOpen}
          onOpenChange={handleExitSelectModal}
        />
        {/* Displaying a subtle message underneath the modals while they are open */}
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-sm px-4 absolute bottom-3">
          Your account setup requires a few quick selections to customize your
          experience.
        </p>
      </div>
    </>
  );
}
