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

export interface Grocery {
  grocery_id: string;
  name: string;
  bought_at: string;
  expires_at: string | null;
  cover_image: string | null;
}

interface GroceriesContextType {
  groceries: Grocery[];
  isLoading: Boolean;
  addGrocery: (newGrocery: Partial<Grocery>) => Promise<Grocery | null>;
  deleteGrocery: (groceryId: string) => Promise<void>;
}

interface GroceriesProviderProps {
  children: ReactNode;
}

const GroceriesContext = createContext<GroceriesContextType | undefined>(
  undefined
);

export function useGroceries() {
  const context = useContext(GroceriesContext);
  if (!context) {
    throw new Error("useGroceries must be used within a GroceriesProvider");
  }
  return context;
}

export function GroceriesProvider({ children }: GroceriesProviderProps) {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const { user, isLoading: userLoading } = useUser();

  const fetchGroceries = async () => {
    setIsLoading(true);

    try {
      if (!user) throw new Error("Error: User must be authenticated!");

      const { data, error } = await supabase
        .from("groceries")
        .select("grocery_id, name, bought_at, expires_at, cover_image")
        .eq("owner_id", user.id);

      if (error) throw error;

      setGroceries(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
      setGroceries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addGrocery = async (
    newGrocery: Partial<Grocery>
  ): Promise<Grocery | null> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { data, error } = await supabase
        .from("groceries")
        .insert(newGrocery)
        .select("grocery_id, name, bought_at, expires_at, cover_image")
        .single();

      if (error) throw error;

      setGroceries((prev) => [...prev, data]);

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

  const deleteGrocery = async (groceryId: string): Promise<void> => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { error } = await supabase
        .from("groceries")
        .delete()
        .eq("grocery_id", groceryId);

      if (error) throw error;

      setGroceries((prev) => prev.filter((g) => g.grocery_id !== groceryId));
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
      fetchGroceries();
    }
  }, [userLoading]);

  const value = {
    groceries,
    isLoading,
    addGrocery,
    deleteGrocery,
  };

  return (
    <GroceriesContext.Provider value={value}>
      {children}
    </GroceriesContext.Provider>
  );
}
