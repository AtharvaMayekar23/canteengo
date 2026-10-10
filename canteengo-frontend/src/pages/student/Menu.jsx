import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMenuItems } from '../../services/api';
import FoodPhoto from '../../components/FoodPhoto';
import { FOOD_CATEGORIES, normalizeCategory } from '../../utils/foodCatalog';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Sync menu & local cart quantity
  const syncMenuWithBackend = async () => {
    try {
      // 1. Fetch menu items from Spring Boot
      const res = await fetchMenuItems();
      const dbItems = res.data;

      // 2. Read local cart for quantities
      const savedCart = JSON.parse(localStorage.getItem('canteengo_cart') || '[]');
      const totalCount = savedCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);

      // 3. Merge backend items with local cart quantity
      const mergedItems = dbItems.map((item) => {
        const foundInCart = savedCart.find((c) => c.name === item.name || c.id === item.id);
        return {
          ...item,
          quantity: foundInCart ? foundInCart.quantity : 0,
        };
      });

      setItems(mergedItems);
    } catch (err) {
      console.error('Failed to fetch menu from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncMenuWithBackend();

    window.addEventListener('cartUpdated', syncMenuWithBackend);
    window.addEventListener('storage', syncMenuWithBackend);

    return () => {
      window.removeEventListener('cartUpdated', syncMenuWithBackend);
      window.removeEventListener('storage', syncMenuWithBackend);
    };
  }, []);

  // Item Quantity Handler
  const handleQuantityChange = (targetItem, delta) => {
    const savedCart = JSON.parse(localStorage.getItem('canteengo_cart') || '[]');
    const existingIndex = savedCart.findIndex((i) => i.name === targetItem.name);

    let updatedCart = [...savedCart];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += delta;
      if (updatedCart[existingIndex].quantity <= 0) {
        updatedCart.splice(existingIndex, 1);
      }
    } else if (delta > 0) {
      updatedCart.push({
        id: targetItem.id,
        name: targetItem.name,
        price: targetItem.price,
        quantity: 1,
      });
    }

    if (updatedCart.length === 0) {
      localStorage.removeItem('canteengo_cart');
    } else {
      localStorage.setItem('canteengo_cart', JSON.stringify(updatedCart));
    }

    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Search & Category Filter
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All'
      || normalizeCategory(item.category).toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Canteen Menu</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Select your favorite food & place order</p>
          </div>
          
          <Link className="relative bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-6 py-3.5 rounded-2xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2" to="/cart">
            <span>View Cart</span>
            {cartCount > 0 && (
              <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search food items (e.g. Vadapav, Coffee)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-900 font-medium text-sm focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', ...FOOD_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid / Loading State */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Loading menu from server...</h3>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">No items found</h3>
            <p className="text-slate-500 text-sm font-medium">Try searching for another food item or change category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qty = item.quantity || 0;
              const isAvailable = item.available !== false;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 transition ${
                    !isAvailable ? 'opacity-60 grayscale' : 'hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <FoodPhoto item={item} className="w-full aspect-[16/10] object-cover rounded-2xl border border-slate-200" />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg">{item.name}</h3>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg inline-block mt-1">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-2xl font-black text-slate-900">₹{item.price}</span>

                    {!isAvailable ? (
                      <span className="text-xs font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                        Out of Stock
                      </span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="bg-slate-900 hover:bg-amber-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
                        <button
                          onClick={() => handleQuantityChange(item, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-900 font-black text-sm shadow-sm hover:bg-slate-200 transition cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-slate-900 text-sm">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-900 font-black text-sm shadow-sm hover:bg-slate-200 transition cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}