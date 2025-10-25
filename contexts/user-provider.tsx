"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase/client";

// Define the context type
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  getToken: () => Promise<string | null>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Call the function to get the initial session
    getInitialSession();

    // Set up the auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const getToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  return (
    <UserContext.Provider value={{ user, isLoading, getToken }}>
      {children}
    </UserContext.Provider>
  );
}
