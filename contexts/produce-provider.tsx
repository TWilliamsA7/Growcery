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

export interface Produce {
  produce_id: string;
  name: string;
  scanned_at: string;
  expires_at: string | null;
  harvest_at: string | null;
  cover_image: string | null;
  viability: number | null;
}

interface ProduceContextType {
  produce: Produce[];
  isLoading: Boolean;
  addProduce: (newProduce: Partial<Produce>) => Promise<Produce | null>;
  deleteProduce: (produceId: string) => Promise<void>;
}

interface ProduceProviderProps {
  children: ReactNode;
}

const ProduceContext = createContext<ProduceContextType | undefined>(undefined);

export function useProduce() {
  const context = useContext(ProduceContext);
  if (!context) {
    throw new Error("useProduce must be used within a ProduceProvider");
  }
  return context;
}

export function ProduceProvider({ children }: ProduceProviderProps) {
  const [produce, setProduce] = useState<Produce[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const { user, isLoading: userLoading } = useUser();

  const fetchProduce = async () => {
    setIsLoading(true);

    try {
      if (!user) throw new Error("Error: User must be authenticated!");

      const { data, error } = await supabase
        .from("produce")
        .select(
          "produce_id, name, scanned_at, harvest_at, expires_at, cover_image, viability"
        )
        .eq("owner_id", user.id);

      if (error) throw error;

      setProduce(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
      setProduce([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addProduce = async (
    newProduce: Partial<Produce>
  ): Promise<Produce | null> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { data, error } = await supabase
        .from("produce")
        .insert(newProduce)
        .select(
          "produce_id, name, scanned_at, harvest_at, expires_at, cover_image, viability"
        )
        .single();

      if (error) throw error;

      setProduce((prev) => [...prev, data]);

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

  const deleteProduce = async (produceId: string): Promise<void> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { error } = await supabase
        .from("produce")
        .delete()
        .eq("produce_id", produceId);

      if (error) throw error;

      setProduce((prev) => prev.filter((p) => p.produce_id !== produceId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchProduce();
    }
  }, [userLoading]);

  const value = {
    produce,
    isLoading,
    addProduce,
    deleteProduce,
  };

  return (
    <ProduceContext.Provider value={value}>{children}</ProduceContext.Provider>
  );
}
