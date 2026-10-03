/** Example foods shown in the Add meal panel. Macros are per serving, in grams / kcal. */
export type Food = {
  id: string;
  name: string;
  serving: string;
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
};

export const FOODS: Food[] = [
  { id: 'chicken', name: 'Chicken breast', serving: '150 g', kcal: 248, protein: 46, carb: 0, fat: 5 },
  { id: 'rice', name: 'Brown rice (cooked)', serving: '150 g', kcal: 166, protein: 3.5, carb: 35, fat: 1.4 },
  { id: 'eggs', name: 'Eggs', serving: '2 large', kcal: 143, protein: 12.6, carb: 0.7, fat: 9.5 },
  { id: 'banana', name: 'Banana', serving: '1 medium', kcal: 105, protein: 1.3, carb: 27, fat: 0.4 },
  { id: 'oats', name: 'Rolled oats', serving: '50 g', kcal: 190, protein: 6.6, carb: 33, fat: 3.5 },
  { id: 'salmon', name: 'Salmon fillet', serving: '150 g', kcal: 312, protein: 33, carb: 0, fat: 19 },
  { id: 'yogurt', name: 'Greek yogurt (plain)', serving: '170 g', kcal: 100, protein: 17, carb: 6, fat: 0.7 },
  { id: 'whey', name: 'Whey protein shake', serving: '1 scoop (30 g)', kcal: 120, protein: 24, carb: 3, fat: 1.5 },
];
