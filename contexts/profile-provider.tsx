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

export interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: "farmer" | "consumer";
}

interface ProfileContextType {
  profile: Profile | null;
}

interface ProfileProviderProps {
  children: ReactNode;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user, isLoading: userLoading } = useUser();

  const fetchProfile = async () => {
    try {
      if (!user) throw new Error("Error: User must be authenticated!");

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, user_type")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!userLoading) {
      fetchProfile();
    }
  }, [userLoading]);

  const value = {
    profile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
