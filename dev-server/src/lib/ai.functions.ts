import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  conditions: z.array(z.string()).max(10),
  dailyGoal: z.number().int().min(800).max(5000),
  consumed: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number(),
  }),
  recentDishes: z.array(z.string()).max(20),
});

export const getAIInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => inputSchema.parse(i))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        text: rulesFallback(data),
        source: "rules" as const,
      };
    }

    const sys = "You are NutriLens, an empathetic Indian nutrition coach. Give ONE short, specific, friendly recommendation (max 2 sentences, no preamble, no markdown). Suggest a concrete Indian dish or swap and tie it to the user's health conditions.";
    const user = `Health conditions: ${data.conditions.join(", ") || "none"}.
Daily goal: ${data.dailyGoal} kcal. Consumed today: ${Math.round(data.consumed.calories)} kcal, P ${Math.round(data.consumed.protein)}g / C ${Math.round(data.consumed.carbs)}g / F ${Math.round(data.consumed.fat)}g / fiber ${Math.round(data.consumed.fiber)}g.
Recent meals: ${data.recentDishes.slice(0, 5).join(", ") || "none"}.
What should they eat next?`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: sys },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        console.error("AI gateway", res.status, await res.text());
        return { text: rulesFallback(data), source: "rules" as const };
      }
      const json = await res.json();
      const text = json?.choices?.[0]?.message?.content?.trim() || rulesFallback(data);
      return { text, source: "ai" as const };
    } catch (e) {
      console.error("AI insight failed", e);
      return { text: rulesFallback(data), source: "rules" as const };
    }
  });

function rulesFallback(d: z.infer<typeof inputSchema>): string {
  const remaining = d.dailyGoal - d.consumed.calories;
  if (d.conditions.includes("diabetes") && d.consumed.fiber < 15) {
    return "Add a fibre-rich dish like Dal Tadka or Moong Dal Khichdi to steady your blood sugar.";
  }
  if (d.conditions.includes("high_bp")) {
    return "Choose low-sodium options like steamed Idli with sambar or Kachumber salad next.";
  }
  if (d.conditions.includes("cholesterol") && d.consumed.fat > 50) {
    return "You've had enough fat today — try a light Khichdi or grilled Tandoori Chicken to wind down.";
  }
  if (remaining < 300) return "You're near your daily goal — finish with a light salad or a cup of dal.";
  if (d.consumed.protein < 40) return "Boost your protein with Tandoori Chicken, Paneer or Rajma next.";
  return "A balanced thali with dal, sabzi and roti will round out your day nicely.";
}
