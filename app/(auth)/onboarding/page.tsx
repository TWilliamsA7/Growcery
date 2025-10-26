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
    </>
  );
}
