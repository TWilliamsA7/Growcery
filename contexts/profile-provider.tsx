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
  location: string | null;
}

interface ProfileContextType {
  profile: Profile | null;
  isLoading: Boolean;
  updateUserType: (userType: "farmer" | "consumer") => Promise<void>;
  updateUserLocation: (location: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const { user, isLoading: userLoading } = useUser();

  const fetchProfile = async () => {
    setIsLoading(true);

    try {
      if (!user) throw new Error("Error: User must be authenticated!");

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email, user_type, location")
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserType = async (userType: "consumer" | "farmer") => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      if (profile?.user_type === userType) return;

      const { error } = await supabase
        .from("profiles")
        .update({ user_type: userType })
        .eq("user_id", user.id);

      setProfile((prev) => (prev ? { ...prev, user_type: userType } : null));

      if (error) throw error;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error has occurred:", err);
      }
    }
  };

  const updateUserLocation = async (location: string) => {
    try {
      if (!user) throw new Error("User is not authenticated!");

      const { error } = await supabase
        .from("profiles")
        .update({ location })
        .eq("user_id", user.id);

      setProfile((prev) => (prev ? { ...prev, location } : null));

      if (error) throw error;
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
      fetchProfile();
    }
  }, [userLoading]);

  const value = {
    profile,
    isLoading,
    updateUserType,
    updateUserLocation,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
