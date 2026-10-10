import FoodCard from './FoodCard';

export default function FoodList({ foodItems, onDeleteItem, onEditItem, isAdmin = false }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4">Current Menu Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {foodItems.map((item) => (
          <FoodCard 
            key={item.id} 
            item={item} 
            onDelete={onDeleteItem} 
            onEdit={onEditItem}
            isAdmin={isAdmin} 
          />
        ))}
      </div>
    </div>
  );
}