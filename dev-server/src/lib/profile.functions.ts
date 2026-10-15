import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  age: z.number().int().min(5).max(110).optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  weight_kg: z.number().min(20).max(300).optional(),
  height_cm: z.number().min(80).max(250).optional(),
  goal: z.enum(["lose", "maintain", "gain"]).optional(),
  daily_calorie_goal: z.number().int().min(800).max(5000).optional(),
  conditions: z.array(z.enum(["diabetes", "obesity", "high_bp", "cholesterol", "fatty_liver"])).optional(),
  onboarded: z.boolean().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update(data).eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
