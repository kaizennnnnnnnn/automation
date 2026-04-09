"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function login(prevState: unknown, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // Check if user has a profile (completed onboarding)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}

export async function signup(prevState: unknown, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding");
}

export async function completeOnboarding(prevState: unknown, formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as string;

  if (!fullName || !role) {
    return { error: "Please fill in all fields." };
  }

  if (!["designer", "caller", "both"].includes(role)) {
    return { error: "Invalid role selected." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const { error } = await supabase.from("profiles").insert({
    user_id: user.id,
    full_name: fullName,
    role,
  });

  if (error) {
    if (error.code === "23505") {
      // Profile already exists, update it
      await supabase
        .from("profiles")
        .update({ full_name: fullName, role })
        .eq("user_id", user.id);
    } else {
      return { error: error.message };
    }
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}
