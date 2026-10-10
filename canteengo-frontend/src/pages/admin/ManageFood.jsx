import { useEffect, useRef, useState } from 'react';
import FoodForm from '../../components/FoodForm';
import FoodList from '../../components/FoodList';
import { createFoodItem, deleteFoodItem, fetchMenuItems, updateFoodItem } from '../../services/api';
import { FOOD_CATEGORIES, normalizeCategory } from '../../utils/foodCatalog';

export default function ManageFood() {
  const [foodItems, setFoodItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const formRef = useRef(null);

  const fetchFoodItems = async () => {
    try {
      const response = await fetchMenuItems();
      setFoodItems(response.data);
    } catch (error) {
      console.error('Error fetching food:', error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const saveFoodItem = async (newItem, itemId) => {
    const item = { ...newItem, price: parseFloat(newItem.price) };
    if (itemId) {
      await updateFoodItem(itemId, item);
    } else {
      await createFoodItem(item);
    }
    await fetchFoodItems();
    setEditingItem(null);
  };

  useEffect(() => {
    if (editingItem) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editingItem]);

  const visibleFoodItems = selectedCategory === 'All'
    ? foodItems
    : foodItems.filter((item) => normalizeCategory(item.category) === selectedCategory);

  const handleDeleteItem = (id) => {
    deleteFoodItem(id)
      .then(fetchFoodItems)
      .catch((err) => console.error('Error deleting item:', err));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Canteen Menu</h1>
      <div ref={formRef}>
        <FoodForm
          key={editingItem?.id || 'new-item'}
          initialItem={editingItem}
          onSubmit={(item) => saveFoodItem(item, editingItem?.id)}
          onCancel={() => setEditingItem(null)}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold text-slate-800">Current Menu Items ({visibleFoodItems.length})</h2>
        <select
          aria-label="Filter menu items by category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <option value="All">All categories</option>
          {FOOD_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
      </div>
      <FoodList
        foodItems={visibleFoodItems}
        onDeleteItem={handleDeleteItem}
        onEditItem={(item) => setEditingItem(item)}
        isAdmin={true}
      />
    </div>
  );
}