"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { z } from "zod";

const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
});

const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Service-role client that bypasses RLS — only for server actions */
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

/** Ensure a profile row exists for the given user */
async function ensureProfile(
  userId: string,
  email: string,
  fullName: string,
  role: string = "client"
) {
  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existing) {
    await admin.from("profiles").insert({
      id: userId,
      email,
      full_name: fullName,
      role,
    });
  }
}

export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("fullName") as string,
  };

  const result = SignUpSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        full_name: result.data.fullName,
        role: "client",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile row directly (in case DB trigger doesn't exist)
  if (data.user) {
    await ensureProfile(
      data.user.id,
      result.data.email,
      result.data.fullName,
      "client"
    );
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = SignInSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch role to determine redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Auto-create profile if missing (handles users created before trigger)
    const fullName = (user.user_metadata?.full_name as string) || "";
    await ensureProfile(user.id, user.email ?? "", fullName, "client");

    const admin = createServiceClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "client";
    redirect(role === "client" ? "/dashboard" : "/admin/dashboard");
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
