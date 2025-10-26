// components/SelectRoleModal.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import GrowceryLogo from "./GrowceryLogo"; // Assuming this path is correct
import { useProfile } from "@/contexts/profile-provider";
import { useState } from "react";
import { toast } from "sonner";

interface SelectRoleModalProps {
  title: string;
  description: string;
  openDefault: boolean;
  open: boolean;
  onOpenChange?: (open: Boolean) => void;
  triggerText?: string; // Added for potential external trigger, though not used in modal itself
}

export function SelectRoleModal({
  title,
  description,
  openDefault = false,
  open,
  onOpenChange,
}: SelectRoleModalProps) {
  const { updateUserType, profile } = useProfile();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelection = async (type: "consumer" | "farmer") => {
    setLoading(true);
    try {
      await updateUserType(type);
      toast.success(`Role updated to ${type}!`, {
        description: "You can change this at any time.",
      });
    } catch (error) {
      toast.error("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog defaultOpen={openDefault} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6 shadow-xl">
        <DialogHeader className="flex flex-col items-center text-center">
          <GrowceryLogo
            width={180}
            height={45}
            alt="Growcery Logo"
            className="w-full h-10 max-w-[150px] mb-2"
          />
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Consumer Role Button */}
          <div className="grid gap-2">
            <Label htmlFor="consumer" className="font-semibold">
              Consumer: Focus on food inventory and expiration dates 🛒
            </Label>
            <Button
              id="consumer"
              variant={
                profile?.user_type === "consumer" ? "default" : "outline"
              }
              disabled={loading || profile?.user_type === "consumer"}
              className={`h-12 text-lg transition-all duration-300 ${
                profile?.user_type === "consumer"
                  ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-500/50"
                  : "border-2 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => handleSelection("consumer")}
            >
              Select Consumer
            </Button>
          </div>

          {/* Farmer Role Button */}
          <div className="grid gap-2">
            <Label htmlFor="farmer" className="font-semibold">
              Farmer: Focus on crop management and harvest planning 🌱
            </Label>
            <Button
              id="farmer"
              variant={profile?.user_type === "farmer" ? "default" : "outline"}
              disabled={loading || profile?.user_type === "farmer"}
              className={`h-12 text-lg transition-all duration-300 ${
                profile?.user_type === "farmer"
                  ? "bg-green-600 hover:bg-green-700 ring-2 ring-green-500/50"
                  : "border-2 border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => handleSelection("farmer")}
            >
              Select Farmer
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button
              disabled={loading}
              variant="default"
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
