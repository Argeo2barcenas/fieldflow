import { cache } from "react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type Role } from "@/lib/jobs/status";

export type CurrentUser = { id: string; fullName: string; role: Role };

const profileSchema = z.object({
  full_name: z.string(),
  role: z.enum(ROLES),
});

// Who is signed in, and with which role. cache() makes every component and
// action that asks during the same request share a single lookup.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();

  const profile = profileSchema.safeParse(row);
  if (!profile.success) return null;

  return {
    id: userId,
    fullName: profile.data.full_name,
    role: profile.data.role,
  };
});
