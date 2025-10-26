"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Crop, useCrop } from "@/contexts/crops-provider";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CropTableProps {
  className?: string;
  past_harvest?: boolean;
  limit?: number;
}

export function CropTable({ past_harvest, limit, className }: CropTableProps) {
  const { crops, deleteCrop, addCrop, isLoading: cropLoading } = useCrop();
  const [displayCrops, setDisplayCrops] = useState<Crop[]>([]);
  const [lastDeletedCrop, setLastDeletedCrop] = useState<Crop | null>(null);
  const [sort, setSort] = useState<"name" | "expDate" | "purDate" | null>(null);
  const [ascending, setAscending] = useState<boolean>(false);

  // sort and filter crops
  useEffect(() => {
    // Filter to only display past_harvest if specified
    const sortedCrops: Crop[] = crops.filter((c) => {
      if (!past_harvest) return true;
      if (
        c.harvest_at &&
        new Date().getTime() - new Date(c.harvest_at).getTime() > 0
      )
        return true;
      return false;
    });

    // Sort based on name, expiration date, or purchase date
    if (sort === "name") {
      sortedCrops.sort(
        (a, b) => (ascending ? 1 : -1) * a.name.localeCompare(b.name)
      );
    } else if (sort === "expDate") {
      sortedCrops.sort((a, b) => {
        if (!a.harvest_at || !b.harvest_at) {
          return 0;
        }

        return (
          (ascending ? 1 : -1) *
          (new Date(a.harvest_at).getTime() - new Date(b.harvest_at).getTime())
        );
      });
    } else if (sort == "purDate") {
      sortedCrops.sort((a, b) => {
        if (!a.scanned_at || !b.scanned_at) {
          return 0;
        }

        return (
          (ascending ? 1 : -1) *
          (new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime())
        );
      });
    }

    if (limit) {
      setDisplayCrops(sortedCrops.slice(0, limit));
    } else {
      setDisplayCrops(sortedCrops);
    }
  }, [sort, ascending, past_harvest, limit, crops, cropLoading]);

  const toggleSort = (sortTag: "name" | "expDate" | "purDate") => {
    if (sortTag == sort) {
      setAscending(!ascending);
    } else {
      setSort(sortTag);
    }
  };

  const handleDelete = async (crop_id: string) => {
    const cropToDelete: Crop | undefined = crops.find(
      (c) => c.crop_id === crop_id
    );
    if (cropToDelete) {
      setLastDeletedCrop(cropToDelete);
      await deleteCrop(crop_id);
      toast("Successfully Deleted Crop!", {
        description: "We have removed this crop from your account",
        // action: {
        //   label: "Undo",
        //   onClick: () => handleRecover(),
        // },
      });
    }
  };

  const handleRecover = async () => {
    if (!lastDeletedCrop) return;
    await addCrop(lastDeletedCrop);
    setLastDeletedCrop(null);
    toast("Recovery Success"!, {
      description:
        "We have recovered your crop and added it back to your account!",
    });
  };

  if (displayCrops.length === 0) {
    return (
      <Table className={`${className}`}>
        <TableCaption>
          You have no{" "}
          {past_harvest ? "crops that are past harvest" : "recent crops"}!
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={5} className="text-center">
              {past_harvest ? "Crops That Are Past Harvest" : "Recent Crops"}
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className=""></TableHead>
            <TableHead className="">Name</TableHead>
            <TableHead>Bought At</TableHead>
            <TableHead className="">Harvest At</TableHead>
            <TableHead className=""></TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }

  return (
    <Table className={`${className}`}>
      <TableCaption>
        A list of your{" "}
        {past_harvest ? "crops that are past harvest" : "recent crops"}.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={5} className="text-center">
            {past_harvest ? "Crops That are Past Harvest" : "Recent Crops"}
          </TableHead>
        </TableRow>
        <TableRow>
          <TableHead className=""></TableHead>
          <TableHead className="">
            <button
              className="flex align-middle justify-items-center"
              onClick={() => toggleSort("name")}
            >
              Name
              {sort === "name" ? (
                ascending ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )
              ) : (
                ""
              )}
            </button>
          </TableHead>
          <TableHead>
            <button
              className="flex align-middle justify-items-center"
              onClick={() => toggleSort("purDate")}
            >
              Bought At
              {sort === "purDate" ? (
                ascending ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )
              ) : (
                ""
              )}
            </button>
          </TableHead>
          <TableHead className="">
            <button
              className="flex align-middle justify-items-center"
              onClick={() => toggleSort("expDate")}
            >
              Harvest At
              {sort === "expDate" ? (
                ascending ? (
                  <ChevronUp className="ml-1 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1 h-4 w-4" />
                )
              ) : (
                ""
              )}
            </button>
          </TableHead>
          <TableHead className=""></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayCrops.map((c) => (
          <TableRow key={c.crop_id}>
            <TableCell>
              <img
                className="h-4 w-4"
                src={c.cover_image ?? "/food-placeholder.svg"}
                alt={c.name}
              />
            </TableCell>
            <TableCell className="font-medium">{c.name}</TableCell>
            <TableCell>
              {c.scanned_at ? new Date(c.scanned_at).toLocaleDateString() : "-"}
            </TableCell>
            <TableCell>
              {c.harvest_at ? new Date(c.harvest_at).toLocaleDateString() : "-"}
            </TableCell>
            <TableCell>
              <button onClick={() => handleDelete(c.crop_id)}>
                <X className="w-8 h-8" />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
