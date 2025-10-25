import { supabase } from "@/utils/supabase/client";

export async function signUpAction({
  email,
  password,
  first_name,
  last_name,
}: {
  email: string;
  password: string;
  first_name: string;
  last_name: string | null;
}): Promise<Boolean> {
  try {
    // Create an account in supabase
    const { data, error: accountCreateError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (accountCreateError) throw accountCreateError;

    if (!data.user) throw new Error("Could not access user object!");

    // Create a profile row
    const { error: profileRowError } = await supabase.from("profiles").insert({
      user_id: data.user?.id,
      first_name: first_name,
      last_name: last_name,
      email: email,
    });

    if (profileRowError) throw profileRowError;

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error has occurred:", err);
    }
    return false;
  }
}

export async function loginAction({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<Boolean> {
  try {
    // Create an account in supabase
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (signInError) throw signInError;

    if (!data.user) throw new Error("Could not access user object!");

    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error("An unknown error has occurred:", err);
    }
    return false;
  }
}
