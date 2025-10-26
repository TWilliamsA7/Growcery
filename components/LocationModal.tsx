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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface LocationModalProps {
  title: string;
  description: string;
  openDefault: boolean;
  open: boolean;
  onOpenChange?: (open: Boolean) => void;
  onSubmit: (location: string) => void;
}

export function LocationModal({
  title,
  description,
  openDefault = false,
  open,
  onOpenChange,
  onSubmit,
}: LocationModalProps) {
  const [location, setLocation] = useState<string>("");

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
              <Label htmlFor="location">Select a Location</Label>
              <Input
                id="location"
                className=""
                value={location}
                placeholder="State/Providence, Country"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => onSubmit(location)} variant="outline">
                Done
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
