import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const logSchema = z.object({
  dish_id: z.string().max(60).optional(),
  dish_name: z.string().min(1).max(120),
  emoji: z.string().max(8).optional(),
  calories: z.number().int().min(0).max(5000),
  protein: z.number().min(0).max(500),
  carbs: z.number().min(0).max(500),
  fat: z.number().min(0).max(500),
  fiber: z.number().min(0).max(200),
  health_score: z.number().int().min(0).max(100).optional(),
});

export const logMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => logSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("meal_logs")
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    const { data: profile } = await supabase
      .from("profiles")
      .select("streak_days, last_log_date")
      .eq("id", userId)
      .maybeSingle();
    if (profile) {
      const last = profile.last_log_date;
      let streak = profile.streak_days ?? 0;
      if (last !== today) {
        const yesterday = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
        streak = last === yesterday ? streak + 1 : 1;
        await supabase.from("profiles").update({ streak_days: streak, last_log_date: today }).eq("id", userId);
      }
    }
    return row;
  });

export const getTodayMeals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("eaten_at", start.toISOString())
      .order("eaten_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { limit?: number } | undefined) => ({ limit: Math.min(i?.limit ?? 100, 200) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: rows, error } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", userId)
      .order("eaten_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { days?: number } | undefined) => ({ days: Math.min(Math.max(i?.days ?? 30, 7), 90) }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - data.days * 86400_000);
    since.setHours(0, 0, 0, 0);
    const { data: rows, error } = await supabase
      .from("meal_logs")
      .select("dish_name, emoji, eaten_at, calories, protein, carbs, fat, fiber, health_score")
      .eq("user_id", userId)
      .gte("eaten_at", since.toISOString())
      .order("eaten_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getWeekReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 7 * 86400_000); since.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("meal_logs")
      .select("eaten_at, calories, protein, carbs, fat, fiber, health_score")
      .eq("user_id", userId)
      .gte("eaten_at", since.toISOString());
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: { id: string }) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("meal_logs").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
