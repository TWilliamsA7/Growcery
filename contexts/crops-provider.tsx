"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./user-provider";
import { supabase } from "@/utils/supabase/client";

export interface Crop {
  crop_id: string;
  name: string;
  scanned_at: string;
  harvest_at: string | null;
  cover_image: string | null;
  viability: number | null;
}

interface CropContextType {
  crops: Crop[];
  isLoading: Boolean;
  addCrop: (newCrop: Partial<Crop>) => Promise<Crop | null>;
  deleteCrop: (cropId: string) => Promise<void>;
}

interface CropProviderProps {
  children: ReactNode;
}

const CropContext = createContext<CropContextType | undefined>(undefined);

export function useCrop() {
  const context = useContext(CropContext);
  if (!context) {
    throw new Error("useCrop must be used within a CropProvider");
  }
  return context;
}

export function CropProvider({ children }: CropProviderProps) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const { user, isLoading: userLoading } = useUser();

  const fetchCrops = async () => {
    setIsLoading(true);

    try {
      if (!user) throw new Error("Error: User must be authenticated!");

      const { data, error } = await supabase
        .from("crops")
        .select("crop_id, name, scanned_at, harvest_at, cover_image, viability")
        .eq("owner_id", user.id)
        .order("harvest_at", { ascending: false });

      if (error) throw error;

      setCrops(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
      setCrops([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addCrop = async (newCrop: Partial<Crop>): Promise<Crop | null> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { data, error } = await supabase
        .from("crops")
        .insert(newCrop)
        .select("crop_id, name, scanned_at, harvest_at, cover_image, viability")
        .single();

      if (error) throw error;

      setCrops((prev) => [...prev, data]);

      return data;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
      return null;
    }
  };

  const deleteCrop = async (cropId: string): Promise<void> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { error } = await supabase
        .from("crops")
        .delete()
        .eq("crop_id", cropId);

      if (error) throw error;

      setCrops((prev) => prev.filter((c) => c.crop_id !== cropId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchCrops();
    }
  }, [userLoading]);

  const value = {
    crops,
    isLoading,
    addCrop,
    deleteCrop,
  };

  return <CropContext.Provider value={value}>{children}</CropContext.Provider>;
}
