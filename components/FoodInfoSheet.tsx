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
import { useState } from "react";
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
  const [foodName, setFoodName] = useState<string>(
    foodInfo.produce_name || foodInfo.crop_name
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-1 rounded-md h-9/10">
        <SheetHeader>
          <SheetTitle className="text-xl">Produce Information</SheetTitle>
          <SheetDescription>
            View information about scanned produce and choose whether keep it or
            not!
          </SheetDescription>
        </SheetHeader>
        <div className="grid justify-center flex-1 auto-rows-min gap-6 px-4">
          <Image
            src={foodImage}
            alt={"Image of food"}
            width={350}
            height={350}
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-row justify-center align-middle">
          <Pencil className="h-4 w-4" />
          <Input
            className="w-7/8 mx-2bg-transparent border-none focus:outline-none p-0 text-xl font-semibold text-gray-900 placeholder:text-gray-500"
            value={foodName}
            autoFocus={false}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </div>

        <div className="w-full mx-2">
          <Label htmlFor="health">Health</Label>
          <p id="health">{foodInfo.health}</p>
          {type === "consumer" ? (
            <>
              <Label htmlFor="expDate">Expiration Date</Label>
              <p id="expDate">{foodInfo.expiration_date}</p>
            </>
          ) : (
            <>
              <Label htmlFor="harDate">Harvest Date</Label>
              <p id="harDate">{foodInfo.harvest_date}</p>
            </>
          )}

          {type === "farmer" ? (
            <>
              <Label htmlFor="disease">Disease</Label>
              <p id="disease">{foodInfo.disease}</p>
              <Label htmlFor="treatment">Treatment</Label>
              <p id="treatment">{foodInfo.treatment}</p>
            </>
          ) : (
            <>
              <Label htmlFor="storage">Recommended Storage Method</Label>
              <p id="storage">{foodInfo.storage_method}</p>
            </>
          )}

          <Label htmlFor="attr">Attributes</Label>
          <p id="attr">{foodInfo.attributes}</p>
          <Label htmlFor="physAttr">Physical Qualities</Label>
          <p id="physAttr">{foodInfo.physical_qualities}</p>
        </div>

        <SheetFooter className="flex flex-row justify-center gap-2 p-4 pt-0">
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
