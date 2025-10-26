// components/LocationModal.tsx
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
import { useState } from "react";
import { Input } from "./ui/input";
import GrowceryLogo from "./GrowceryLogo"; // Assuming this path is correct or adjust if needed

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    onSubmit(location);
    // Optionally close the dialog if submission is successful
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <Dialog defaultOpen={openDefault} open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
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
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-left font-semibold">
                Select a Location
              </Label>
              <Input
                id="location"
                className="h-10"
                value={location}
                placeholder="City, State/Province, Country"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={() => onSubmit(location)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={!location.trim()} // Disable if input is empty
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
