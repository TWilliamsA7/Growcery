"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { GeminiResponse } from "@/lib/types/classification";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Pencil } from "lucide-react";

interface FoodInfoSheetProps {
  open: boolean;
  foodImage: string;
  type: "consumer" | "farmer";
  foodInfo: GeminiResponse;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function FoodInfoSheet({
  open,
  foodImage,
  type,
  foodInfo,
  onOpenChange,
  onSave,
  onDiscard,
}: FoodInfoSheetProps) {
  // ensure controlled derived initial state when the sheet opens/changes foodInfo
  const [foodName, setFoodName] = useState<string>(
    foodInfo?.name || foodInfo?.name || ""
  );

  // Keep foodName in sync when foodInfo prop changes (e.g., new scan)
  useEffect(() => {
    setFoodName(foodInfo?.name || foodInfo?.name || "");
  }, [foodInfo]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* 
        - h-[90vh] keeps sheet tall but leaves room for the status bar/home indicator.
        - rounded-t-2xl gives a nice mobile sheet look.
        - style adds safe-area padding to the whole sheet content and lets inner parts scroll.
      */}
      <SheetContent
        side="bottom"
        className="mx-1 rounded-t-2xl h-[90vh] max-h-[92vh] p-0"
        style={{
          // ensure content & footer are offset from mobile home indicator + top notch
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        {/* Grabber */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div
            className="w-14 h-1.5 rounded-full bg-zinc-300/40"
            aria-hidden
            style={{ opacity: 0.9 }}
          />
        </div>

        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="text-xl">Produce Information</SheetTitle>
          <SheetDescription className="text-sm">
            View information about scanned produce and choose whether to keep it
            or not.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable content area */}
        <div
          className="px-4 overflow-auto flex-1 flex flex-col gap-4"
          // give it a sensible scrollable height (content area)
          style={{ minHeight: 0 }}
        >
          {/* Image */}
          <div className="w-full flex justify-center">
            {/* Responsive square: small = 160px, sm = 200px, md = 256px */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-md overflow-hidden bg-gray-100">
              <Image
                src={foodImage}
                alt="Image of food"
                fill
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 200px, 256px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Editable name row */}
          <div className="flex items-center gap-2 px-1">
            <Pencil className="h-5 w-5 text-zinc-700" />
            <Input
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-semibold text-gray-900 placeholder:text-gray-500"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              aria-label="Food name"
            />
          </div>

          <div>
            <Label htmlFor="confidence">AI Confidence</Label>
            <p id="confidence" className="text-sm">
              {foodInfo.confidence || "—"}
            </p>
          </div>

          {/* Info fields */}
          <div className="space-y-3 px-1">
            <div>
              <Label htmlFor="health">Health</Label>
              <p id="health" className="text-sm">
                {foodInfo.condition || "—"}
              </p>
            </div>

            {type === "consumer" ? (
              <div>
                <Label htmlFor="expDate">Expiration Date</Label>
                <p id="expDate" className="text-sm">
                  {foodInfo.expirationDate || "—"}
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="harDate">Harvest Date</Label>
                <p id="harDate" className="text-sm">
                  {foodInfo.expirationDate || "—"}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="storage">Recommended Storage Method</Label>
              <p id="storage" className="text-sm">
                {foodInfo.storageInstructions || "—"}
              </p>
            </div>
            <div>
              <Label htmlFor="attr">Features</Label>
              <p id="attr" className="text-sm">
                {foodInfo.features || "—"}
              </p>
            </div>

            <div>
              <Label htmlFor="physAttr">Sensory Characteristics</Label>
              <p id="physAttr" className="text-sm">
                {foodInfo.sensoryCharacteristics || "—"}
              </p>
            </div>

            <p className="text-center text-xs text-primary/90">
              *Expiration dates are based on recommended storage practices
            </p>
          </div>
        </div>

        {/* Footer — keep it visually above safe area with extra padding */}
        <SheetFooter
          className="flex flex-row justify-center gap-2 p-4 pt-3"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        >
          <Button
            onClick={onDiscard}
            className="bg-red-500 text-white hover:bg-red-700 w-auto shadow-md"
          >
            Discard Item
          </Button>
          <Button
            onClick={onSave}
            className="bg-green-600 text-white hover:bg-green-700 w-auto shadow-md"
          >
            Save Item
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
