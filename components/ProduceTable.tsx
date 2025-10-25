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

import { Produce, useProduce } from "@/contexts/produce-provider";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ProduceTableProps {
  className?: string;
  expired?: boolean;
  limit?: number;
}

export function ProduceTable({ expired, limit, className }: ProduceTableProps) {
  const { produce } = useProduce();
  const [displayProduce, setDisplayProduce] = useState<Produce[]>([]);
  const [sort, setSort] = useState<"name" | "expDate" | "purDate" | null>(null);
  const [ascending, setAscending] = useState<boolean>(false);

  // sort and filter produce
  useEffect(() => {
    // Filter to only display expired if specified
    const sortedProduce: Produce[] = produce.filter((p) => {
      if (!expired) return true;
      if (
        p.expires_at &&
        new Date().getTime() - new Date(p.expires_at).getTime() > 0
      )
        return true;
      return false;
    });

    // Sort based on name, expiration date, or purchase date
    if (sort === "name") {
      sortedProduce.sort(
        (a, b) => (ascending ? 1 : -1) * a.name.localeCompare(b.name)
      );
    } else if (sort === "expDate") {
      sortedProduce.sort((a, b) => {
        if (!a.expires_at || !b.expires_at) {
          return 0;
        }

        return (
          (ascending ? 1 : -1) *
          (new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
        );
      });
    } else if (sort == "purDate") {
      sortedProduce.sort((a, b) => {
        if (!a.bought_at || !b.bought_at) {
          return 0;
        }

        return (
          (ascending ? 1 : -1) *
          (new Date(a.bought_at).getTime() - new Date(b.bought_at).getTime())
        );
      });
    }

    if (limit) {
      setDisplayProduce(sortedProduce.slice(0, limit));
    } else {
      setDisplayProduce(sortedProduce);
    }
  }, [sort, ascending, expired, limit]);

  const toggleSort = (sortTag: "name" | "expDate" | "purDate") => {
    if (sortTag == sort) {
      setAscending(!ascending);
    } else {
      setSort(sortTag);
    }
  };

  if (displayProduce.length === 0) {
    return (
      <Table className={`${className}`}>
        <TableCaption>
          You have no {expired ? "expired" : "recent"} produce!
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={4} className="text-center">
              {expired ? "Expired" : "Recent"} Produce
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className=""></TableHead>
            <TableHead className="">Name</TableHead>
            <TableHead>Bought At</TableHead>
            <TableHead className="">Expire{expired ? "d" : "s"} At</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
  }

  return (
    <Table className={`${className}`}>
      <TableCaption>
        A list of your {expired ? "expired" : "recent"} produce.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={4} className="text-center">
            {expired ? "Expired" : "Recent"} Produce
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
              Expire{expired ? "d" : "s"} At
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayProduce.map((p) => (
          <TableRow key={p.produce_id}>
            <TableCell>
              <img
                className="h-4 w-4"
                src={p.cover_image ?? "/food-placeholder.svg"}
                alt={p.name}
              />
            </TableCell>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>
              {p.bought_at ? new Date(p.bought_at).toLocaleDateString() : "-"}
            </TableCell>
            <TableCell>
              {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
