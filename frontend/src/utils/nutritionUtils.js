export const calculateItemMacros = (food, grammi) => {
  if (!food || !grammi || grammi <= 0) {
    return { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 };
  }
  const ratio = grammi / 100;
  return {
    calorie: Math.round((food.calorie || 0) * ratio),
    proteine: Number(((food.proteine || 0) * ratio).toFixed(1)),
    carboidrati: Number(((food.carboidrati || 0) * ratio).toFixed(1)),
    grassi: Number(((food.grassi || 0) * ratio).toFixed(1)),
  };
};

export const calculateMealTotals = (mealItems, availableFoods) => {
  return mealItems.reduce(
    (acc, item) => {
      const food = availableFoods.find((f) => f.id === Number(item.foodId));
      const macros = calculateItemMacros(food, item.grammi);
      return {
        calorie: acc.calorie + macros.calorie,
        proteine: Number((acc.proteine + macros.proteine).toFixed(1)),
        carboidrati: Number((acc.carboidrati + macros.carboidrati).toFixed(1)),
        grassi: Number((acc.grassi + macros.grassi).toFixed(1)),
      };
    },
    { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 }
  );
};

export const calculateDayTotals = (meals, availableFoods) => {
  return meals.reduce(
    (acc, meal) => {
      const mealTotals = calculateMealTotals(meal.mealItems || [], availableFoods);
      return {
        calorie: acc.calorie + mealTotals.calorie,
        proteine: Number((acc.proteine + mealTotals.proteine).toFixed(1)),
        carboidrati: Number((acc.carboidrati + mealTotals.carboidrati).toFixed(1)),
        grassi: Number((acc.grassi + mealTotals.grassi).toFixed(1)),
      };
    },
    { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 }
  );
};