export const FOOD_CATEGORIES = ['Breakfast', 'Snacks', 'Beverages', 'Fast Food', 'Lunch'];

export function normalizeCategory(category) {
  const trimmedCategory = (category || '').trim();
  const knownCategory = FOOD_CATEGORIES.find(
    (option) => option.toLowerCase() === trimmedCategory.toLowerCase(),
  );

  return knownCategory || trimmedCategory;
}

export function getFoodImage(item) {
  return item.imageUrl || null;
}