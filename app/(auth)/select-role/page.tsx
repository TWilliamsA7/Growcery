"use client";

import { SelectRoleModal } from "@/components/SelectRoleModal";
import { useUser } from "@/contexts/user-provider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SelectRolePage() {
  const { user } = useUser();
  const router = useRouter();

  const handleExit = (open: Boolean) => {
    if (open === false) {
      toast("Thank you for your choice", {
        description: "It can be changed at any point later",
      });
      router.push("/home");
    }
  };

  return (
    <>
      <SelectRoleModal
        title="Select Role"
        description="This will determine stuff"
        openDefault={true}
        triggerText="Open It"
        onOpenChange={handleExit}
      />
    </>
  );
}
