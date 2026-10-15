// Indian food database for NutriLens AI (Phase 2)
// Per-serving nutrition with disease-aware flags.

export type Condition =
  | "diabetes"
  | "obesity"
  | "high_bp"
  | "cholesterol"
  | "fatty_liver";

export type Dish = {
  id: string;
  name: string;
  emoji: string;
  servingLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar?: number;
  sodium_mg?: number;
  sat_fat?: number;
  glycemic?: "low" | "medium" | "high";
  fried?: boolean;
  tags: string[];
  notes: string;
};

export const CONDITION_META: Record<Condition, { label: string; emoji: string; color: string }> = {
  diabetes: { label: "Diabetes", emoji: "🩸", color: "#c47e6c" },
  obesity: { label: "Weight Management", emoji: "⚖️", color: "#c9a36a" },
  high_bp: { label: "High Blood Pressure", emoji: "💗", color: "#b86b8a" },
  cholesterol: { label: "Cholesterol", emoji: "🫀", color: "#a07cc4" },
  fatty_liver: { label: "Fatty Liver", emoji: "🌿", color: "#7d9b76" },
};

export const DISHES: Dish[] = [
  { id: "thali", name: "Balanced Veg Thali", emoji: "🍛", servingLabel: "1 plate", calories: 620, protein: 22, carbs: 78, fat: 22, fiber: 11, sugar: 8, sodium_mg: 950, sat_fat: 7, glycemic: "medium", tags: ["Balanced", "Vegetarian", "High Fiber"], notes: "Dal, sabzi, rice and roti — a well-rounded plate." },
  { id: "paneer", name: "Paneer Butter Masala", emoji: "🧈", servingLabel: "1 cup", calories: 450, protein: 18, carbs: 14, fat: 36, fiber: 3, sugar: 6, sodium_mg: 820, sat_fat: 18, glycemic: "low", tags: ["High Protein", "High Fat"], notes: "Rich and creamy — great protein, heavy in saturated fat." },
  { id: "biryani", name: "Chicken Biryani", emoji: "🍚", servingLabel: "1 plate", calories: 720, protein: 28, carbs: 88, fat: 24, fiber: 4, sugar: 4, sodium_mg: 1280, sat_fat: 8, glycemic: "high", tags: ["High Protein", "High Carb"], notes: "Hearty and protein-rich. Pair with raita to balance." },
  { id: "dosa", name: "Masala Dosa", emoji: "🥞", servingLabel: "1 dosa", calories: 390, protein: 9, carbs: 56, fat: 14, fiber: 4, sugar: 3, sodium_mg: 680, sat_fat: 4, glycemic: "medium", tags: ["Vegetarian", "South Indian"], notes: "Light and crispy. Coconut chutney adds healthy fats." },
  { id: "samosa", name: "Samosa", emoji: "🥟", servingLabel: "2 pieces", calories: 520, protein: 7, carbs: 52, fat: 30, fiber: 4, sugar: 3, sodium_mg: 720, sat_fat: 11, fried: true, glycemic: "high", tags: ["Fried", "Snack"], notes: "Deep-fried — enjoy occasionally." },
  { id: "idli", name: "Idli Sambar", emoji: "🍙", servingLabel: "3 idlis + sambar", calories: 280, protein: 11, carbs: 52, fat: 3, fiber: 6, sugar: 4, sodium_mg: 540, sat_fat: 1, glycemic: "medium", tags: ["Low Fat", "High Fiber", "Diabetes Friendly"], notes: "Steamed and fermented — easy on digestion." },
  { id: "chole", name: "Chole Bhature", emoji: "🫓", servingLabel: "1 plate", calories: 680, protein: 18, carbs: 82, fat: 30, fiber: 9, sugar: 6, sodium_mg: 1100, sat_fat: 9, fried: true, glycemic: "high", tags: ["High Protein", "Heavy"], notes: "Protein-rich chickpeas, but bhature is deep-fried." },
  { id: "rajma", name: "Rajma Chawal", emoji: "🍲", servingLabel: "1 bowl", calories: 480, protein: 17, carbs: 78, fat: 9, fiber: 12, sugar: 5, sodium_mg: 720, sat_fat: 3, glycemic: "medium", tags: ["High Fiber", "Plant Protein"], notes: "Kidney beans + rice — fibre-rich comfort food." },
  { id: "palak", name: "Palak Paneer", emoji: "🥬", servingLabel: "1 cup", calories: 320, protein: 16, carbs: 12, fat: 22, fiber: 5, sugar: 3, sodium_mg: 680, sat_fat: 10, glycemic: "low", tags: ["High Protein", "Iron Rich"], notes: "Spinach + paneer — iron, calcium and protein in one." },
  { id: "dal", name: "Dal Tadka", emoji: "🥣", servingLabel: "1 bowl", calories: 230, protein: 12, carbs: 28, fat: 7, fiber: 8, sugar: 3, sodium_mg: 580, sat_fat: 2, glycemic: "low", tags: ["Low Fat", "Plant Protein", "Diabetes Friendly"], notes: "Lentils — a daily staple of clean Indian eating." },
  { id: "roti", name: "Roti / Chapati", emoji: "🫓", servingLabel: "2 rotis", calories: 220, protein: 6, carbs: 42, fat: 4, fiber: 5, sugar: 1, sodium_mg: 220, sat_fat: 1, glycemic: "medium", tags: ["Whole Wheat"], notes: "Whole-wheat flatbread — pair with sabzi and dal." },
  { id: "rice", name: "Steamed Basmati Rice", emoji: "🍚", servingLabel: "1 cup", calories: 210, protein: 4, carbs: 46, fat: 0.5, fiber: 1, sugar: 0, sodium_mg: 5, sat_fat: 0, glycemic: "high", tags: ["High Carb"], notes: "Refined carb — keep portions moderate." },
  { id: "poha", name: "Poha", emoji: "🥘", servingLabel: "1 bowl", calories: 270, protein: 6, carbs: 48, fat: 7, fiber: 3, sugar: 4, sodium_mg: 480, sat_fat: 2, glycemic: "medium", tags: ["Light Breakfast"], notes: "Flattened rice — quick, light breakfast." },
  { id: "upma", name: "Upma", emoji: "🥣", servingLabel: "1 bowl", calories: 300, protein: 7, carbs: 50, fat: 8, fiber: 4, sugar: 2, sodium_mg: 520, sat_fat: 2, glycemic: "medium", tags: ["South Indian", "Breakfast"], notes: "Semolina porridge with veggies." },
  { id: "pav_bhaji", name: "Pav Bhaji", emoji: "🍞", servingLabel: "1 plate", calories: 600, protein: 12, carbs: 70, fat: 28, fiber: 8, sugar: 8, sodium_mg: 1320, sat_fat: 12, glycemic: "high", tags: ["Street Food"], notes: "Buttery and savoury — high in sodium and butter." },
  { id: "vada_pav", name: "Vada Pav", emoji: "🍔", servingLabel: "1 piece", calories: 290, protein: 6, carbs: 38, fat: 13, fiber: 3, sugar: 3, sodium_mg: 620, sat_fat: 4, fried: true, glycemic: "high", tags: ["Fried", "Street Food"], notes: "Mumbai's burger — fried potato in a bun." },
  { id: "tandoori", name: "Tandoori Chicken", emoji: "🍗", servingLabel: "4 pieces", calories: 340, protein: 38, carbs: 4, fat: 18, fiber: 0, sugar: 1, sodium_mg: 720, sat_fat: 5, glycemic: "low", tags: ["High Protein", "Grilled"], notes: "Grilled, marinated chicken — excellent protein." },
  { id: "butter_chicken", name: "Butter Chicken", emoji: "🍛", servingLabel: "1 cup", calories: 490, protein: 26, carbs: 12, fat: 36, fiber: 2, sugar: 6, sodium_mg: 880, sat_fat: 16, glycemic: "low", tags: ["High Protein", "High Fat"], notes: "Cream and butter heavy — watch saturated fat." },
  { id: "fish_curry", name: "Fish Curry", emoji: "🐟", servingLabel: "1 bowl", calories: 320, protein: 28, carbs: 8, fat: 18, fiber: 2, sugar: 3, sodium_mg: 760, sat_fat: 5, glycemic: "low", tags: ["Omega-3", "High Protein"], notes: "Coconut-based fish curry — heart-friendly fats." },
  { id: "khichdi", name: "Moong Dal Khichdi", emoji: "🥣", servingLabel: "1 bowl", calories: 310, protein: 12, carbs: 52, fat: 5, fiber: 6, sugar: 2, sodium_mg: 380, sat_fat: 1, glycemic: "low", tags: ["Easy Digest", "Diabetes Friendly"], notes: "Comfort food — gentle, balanced, low GI." },
  { id: "gulab_jamun", name: "Gulab Jamun", emoji: "🍩", servingLabel: "2 pieces", calories: 380, protein: 4, carbs: 56, fat: 16, fiber: 0, sugar: 48, sodium_mg: 80, sat_fat: 7, fried: true, glycemic: "high", tags: ["Dessert", "High Sugar"], notes: "Sugar-soaked dessert — occasional indulgence." },
  { id: "jalebi", name: "Jalebi", emoji: "🍥", servingLabel: "2 pieces", calories: 300, protein: 2, carbs: 52, fat: 10, fiber: 0, sugar: 42, sodium_mg: 30, sat_fat: 4, fried: true, glycemic: "high", tags: ["Dessert", "High Sugar"], notes: "Deep-fried, syrup-soaked — very high glycemic." },
  { id: "lassi", name: "Sweet Lassi", emoji: "🥛", servingLabel: "1 glass", calories: 260, protein: 8, carbs: 38, fat: 8, fiber: 0, sugar: 32, sodium_mg: 120, sat_fat: 5, glycemic: "medium", tags: ["Dairy", "Sweet"], notes: "Yogurt drink — try unsweetened/salted version." },
  { id: "chai", name: "Masala Chai", emoji: "☕", servingLabel: "1 cup", calories: 90, protein: 3, carbs: 12, fat: 3, fiber: 0, sugar: 10, sodium_mg: 40, sat_fat: 2, glycemic: "medium", tags: ["Beverage"], notes: "Sweet milky tea — sugar adds up across the day." },
  { id: "salad", name: "Kachumber Salad", emoji: "🥗", servingLabel: "1 bowl", calories: 60, protein: 2, carbs: 10, fat: 1, fiber: 4, sugar: 5, sodium_mg: 180, sat_fat: 0, glycemic: "low", tags: ["Fresh", "Low Cal"], notes: "Onion, tomato, cucumber — great side." },
];

export function pickRandomDish(seed?: number): Dish {
  const i = seed != null
    ? Math.abs(Math.floor(seed)) % DISHES.length
    : Math.floor(Math.random() * DISHES.length);
  return DISHES[i];
}

export function findDish(id: string): Dish | undefined {
  return DISHES.find((d) => d.id === id);
}

/** 0–100 nutrition score. */
export function healthScore(d: Dish): number {
  const totalMacro = d.protein * 4 + d.carbs * 4 + d.fat * 9;
  const fatPct = (d.fat * 9) / totalMacro;
  const proteinPct = (d.protein * 4) / totalMacro;
  const fiberBonus = Math.min(d.fiber / 12, 1) * 25;
  const proteinBonus = Math.min(proteinPct / 0.25, 1) * 25;
  const fatPenalty = Math.max(0, fatPct - 0.3) * 100;
  const caloriePenalty = Math.max(0, (d.calories - 500) / 20);
  const sugarPenalty = Math.min((d.sugar ?? 0) / 4, 15);
  const score = 60 + fiberBonus + proteinBonus - fatPenalty - caloriePenalty - sugarPenalty;
  return Math.max(15, Math.min(98, Math.round(score)));
}

export function scoreLabel(score: number): { label: string; tone: "good" | "ok" | "watch" } {
  if (score >= 75) return { label: "Excellent", tone: "good" };
  if (score >= 55) return { label: "Balanced", tone: "ok" };
  return { label: "Indulgent", tone: "watch" };
}

/** Disease-aware warnings + tips. */
export type Warning = { level: "warn" | "tip"; condition: Condition; text: string };

export function warningsForDish(d: Dish, conditions: Condition[]): Warning[] {
  const out: Warning[] = [];
  const has = (c: Condition) => conditions.includes(c);

  if (has("diabetes")) {
    if ((d.sugar ?? 0) >= 15) out.push({ level: "warn", condition: "diabetes", text: `High sugar (${d.sugar}g) — can spike blood glucose.` });
    if (d.glycemic === "high") out.push({ level: "warn", condition: "diabetes", text: "High glycemic — pair with fibre or protein to slow absorption." });
    if (d.fiber >= 8) out.push({ level: "tip", condition: "diabetes", text: "Good fibre — helps steady blood sugar." });
  }
  if (has("obesity")) {
    if (d.calories >= 600) out.push({ level: "warn", condition: "obesity", text: `Calorie-dense (${d.calories} kcal) — halve the portion if cutting weight.` });
    if (d.fried) out.push({ level: "warn", condition: "obesity", text: "Deep-fried — adds hidden calories." });
  }
  if (has("high_bp")) {
    if ((d.sodium_mg ?? 0) >= 900) out.push({ level: "warn", condition: "high_bp", text: `High sodium (~${d.sodium_mg}mg) — limit salty sides today.` });
    if ((d.sodium_mg ?? 0) <= 300) out.push({ level: "tip", condition: "high_bp", text: "Low sodium — good choice for BP." });
  }
  if (has("cholesterol")) {
    if ((d.sat_fat ?? 0) >= 10) out.push({ level: "warn", condition: "cholesterol", text: `High saturated fat (${d.sat_fat}g) — go easy on dairy/ghee today.` });
    if (d.fried) out.push({ level: "warn", condition: "cholesterol", text: "Fried foods raise LDL — choose grilled or steamed alternatives." });
  }
  if (has("fatty_liver")) {
    if ((d.sugar ?? 0) >= 20) out.push({ level: "warn", condition: "fatty_liver", text: "Added sugars worsen liver fat — skip dessert today." });
    if (d.fried) out.push({ level: "warn", condition: "fatty_liver", text: "Fried oil stresses the liver — opt for steamed/grilled." });
  }
  return out;
}

/** Personalised daily calorie target (Mifflin–St Jeor). */
export function calculateDailyCalories(opts: {
  age: number; sex: string; weight_kg: number; height_cm: number; goal: string;
}): number {
  const { age, sex, weight_kg, height_cm, goal } = opts;
  const bmr = sex === "female"
    ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  const tdee = bmr * 1.45; // lightly active default
  const adj = goal === "lose" ? -400 : goal === "gain" ? 300 : 0;
  return Math.round((tdee + adj) / 10) * 10;
}

/** Quick rule-based meal suggestion. */
export function suggestNextMeal(conditions: Condition[], remainingCalories: number): Dish {
  const safe = DISHES.filter((d) => warningsForDish(d, conditions).filter((w) => w.level === "warn").length === 0);
  const fit = safe.filter((d) => d.calories <= Math.max(250, remainingCalories));
  const pool = fit.length ? fit : safe.length ? safe : DISHES;
  // Prefer high score
  return [...pool].sort((a, b) => healthScore(b) - healthScore(a))[0];
}
