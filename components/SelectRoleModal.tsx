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
import { useProfile } from "@/contexts/profile-provider";
import { useState } from "react";
import { toast } from "sonner";

interface SelectRoleModalProps {
  title: string;
  description: string;
  openDefault: boolean;
  open: boolean;
  onOpenChange?: (open: Boolean) => void;
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
    await updateUserType(type);
    toast(`Updated role to ${type}`, {
      description: "Can be changed at an time later on",
    });
    setLoading(false);
  };

  return (
    <Dialog defaultOpen={openDefault} open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="consumer">Consumer</Label>
              <Button
                id="consumer"
                className={`${
                  profile?.user_type === "consumer"
                    ? "border-3 border-amber-600"
                    : ""
                }`}
                onClick={() => {
                  updateUserType("consumer");
                  toast("Updated role to consumer", {
                    description: "Can be changed at an time later on",
                  });
                }}
              >
                Consumer
              </Button>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="farmer">Farmer</Label>
              <Button
                id="farmer"
                className={`${
                  profile?.user_type === "farmer"
                    ? "border-3 border-amber-600"
                    : ""
                }`}
                onClick={() => {
                  updateUserType("farmer");
                  toast("Updated role to farmer", {
                    description: "Can be changed at an time later on",
                  });
                }}
              >
                Farmer
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={loading} variant="outline">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
