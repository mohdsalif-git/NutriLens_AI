import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DISHES } from "@/lib/food-db";

type ChatBody = {
  messages: UIMessage[];
  profile?: {
    name?: string;
    age?: number | null;
    sex?: string | null;
    weight_kg?: number | null;
    height_cm?: number | null;
    goal?: string | null;
    daily_calorie_goal?: number | null;
    conditions?: string[];
  };
  todayTotals?: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  recentMeals?: string[];
};

function buildSystemPrompt(body: ChatBody): string {
  const p = body.profile ?? {};
  const t = body.todayTotals ?? { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  const dishList = DISHES.map((d) => `${d.name} (${d.calories}kcal, P${d.protein}/C${d.carbs}/F${d.fat}, fiber ${d.fiber}g${d.glycemic ? `, GI ${d.glycemic}` : ""}${d.fried ? ", fried" : ""})`).join("; ");

  return `You are NutriLens, a friendly, warm, intelligent Indian nutrition coach inside a mobile app.

USER PROFILE
- Name: ${p.name ?? "Friend"}
- Age/Sex: ${p.age ?? "?"} / ${p.sex ?? "?"}
- Weight/Height: ${p.weight_kg ?? "?"} kg / ${p.height_cm ?? "?"} cm
- Goal: ${p.goal ?? "maintain"}
- Daily calorie target: ${p.daily_calorie_goal ?? 2000} kcal
- Health conditions: ${(p.conditions ?? []).join(", ") || "none reported"}

TODAY SO FAR
- ${Math.round(t.calories)} kcal · P ${Math.round(t.protein)}g / C ${Math.round(t.carbs)}g / F ${Math.round(t.fat)}g / fiber ${Math.round(t.fiber)}g
- Recent meals: ${(body.recentMeals ?? []).join(", ") || "none logged yet"}

KNOWN INDIAN DISHES (use these numbers when relevant): ${dishList}

STYLE RULES
- Be warm, concise and conversational — talk like a knowledgeable Indian friend, not a textbook.
- Default to short answers (2–5 sentences). Use bullet points only when listing 3+ items.
- Personalize every reply to the user's conditions and remaining calories when relevant.
- Suggest concrete Indian dishes, swaps, or portions — never vague advice like "eat healthy".
- For diabetes: prefer low-GI, high-fibre. For high BP: low-sodium. For cholesterol: low saturated fat. For weight loss: protein + fibre, mind calories.
- If the user describes a craving or stress eating, gently acknowledge the emotion before suggesting a healthier swap.
- Never claim to diagnose. For medication or medical questions, suggest consulting their doctor.
- Use simple plain language, occasional emojis (🌿🍛🩸) — don't overdo it.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("AI not configured", { status: 500 });

        // Auth: read bearer token & resolve user; enrich profile from DB if not provided
        const auth = request.headers.get("authorization");
        let userId: string | null = null;
        if (auth?.startsWith("Bearer ")) {
          const token = auth.slice(7);
          const { data } = await supabaseAdmin.auth.getUser(token);
          userId = data.user?.id ?? null;
        }

        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) return new Response("messages required", { status: 400 });

        // Enrich with server-side profile + today's meals if user is authed
        if (userId) {
          try {
            const [{ data: prof }, { data: meals }] = await Promise.all([
              supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
              supabaseAdmin.from("meal_logs").select("dish_name, calories, protein, carbs, fat, fiber, eaten_at")
                .eq("user_id", userId)
                .gte("eaten_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
                .order("eaten_at", { ascending: false }),
            ]);
            if (prof) {
              body.profile = {
                name: prof.full_name ?? undefined,
                age: prof.age, sex: prof.sex, weight_kg: prof.weight_kg, height_cm: prof.height_cm,
                goal: prof.goal, daily_calorie_goal: prof.daily_calorie_goal,
                conditions: prof.conditions ?? [],
              };
            }
            if (meals) {
              body.todayTotals = meals.reduce(
                (a, m: any) => ({
                  calories: a.calories + (m.calories ?? 0),
                  protein: a.protein + Number(m.protein ?? 0),
                  carbs: a.carbs + Number(m.carbs ?? 0),
                  fat: a.fat + Number(m.fat ?? 0),
                  fiber: a.fiber + Number(m.fiber ?? 0),
                }),
                { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
              );
              body.recentMeals = meals.slice(0, 6).map((m: any) => m.dish_name);
            }
          } catch (e) {
            console.error("chat enrich failed", e);
          }
        }

        const gateway = createLovableAiGatewayProvider(apiKey);
        const result = streamText({
          model: gateway("google/gemini-2.5-flash"),
          system: buildSystemPrompt(body),
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: body.messages });
      },
    },
  },
});
