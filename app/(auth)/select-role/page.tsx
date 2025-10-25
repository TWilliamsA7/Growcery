"use client";

import { SelectRoleModal } from "@/components/SelectRoleModal";
import { useUser } from "@/contexts/user-provider";

export default function SignupForm() {
  const { user } = useUser();

  return (
    <>
      <SelectRoleModal
        title="Select Role"
        description="This will determine stuff"
        openDefault={true}
        triggerText="Open It"
      />
    </>
  );
}
