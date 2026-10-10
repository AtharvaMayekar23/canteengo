import { useState } from 'react';
import { FOOD_CATEGORIES, normalizeCategory } from '../utils/foodCatalog';

const EMPTY_ITEM = {
  name: '',
  category: 'Snacks',
  price: '',
  description: '',
  imageUrl: '',
  available: true,
};

export default function FoodForm({ onSubmit, initialItem, onCancel }) {
  const [newItem, setNewItem] = useState(() => initialItem ? { ...initialItem } : { ...EMPTY_ITEM });
  const [imageError, setImageError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const hasUploadedPhoto = typeof newItem.imageUrl === 'string' && newItem.imageUrl.startsWith('data:');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSubmitError('');
    try {
      await onSubmit({ ...newItem, category: normalizeCategory(newItem.category) });
      if (!initialItem) setNewItem({ ...EMPTY_ITEM });
    } catch (error) {
      setSubmitError(error.response?.data?.detail || 'Could not save this menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setImageError('Choose an image smaller than 4 MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNewItem((current) => ({ ...current, imageUrl: String(reader.result) }));
      setImageError('');
    };
    reader.onerror = () => setImageError('Could not read this image. Choose another file.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg mb-8 border border-slate-800">
      <h2 className="text-lg font-semibold text-amber-400 mb-4">
        {initialItem ? `Edit ${initialItem.name}` : 'Add to Canteen Menu'}
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Item Name (e.g. Samosa)"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
          className="bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          required
          className="bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
        />
        <select
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
        >
          {FOOD_CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
        />
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
          <label className="block text-xs font-bold text-slate-300">
            Photo URL (optional)
            <input
              type="url"
              placeholder="https://example.com/food.jpg"
              value={hasUploadedPhoto ? '' : newItem.imageUrl || ''}
              onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              className="mt-1 w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 text-sm font-normal focus:outline-none focus:border-amber-500"
            />
          </label>
          <label className="cursor-pointer bg-slate-800 border border-slate-700 text-slate-200 rounded-xl p-3 text-sm hover:border-amber-500 transition">
            {newItem.imageUrl ? 'Replace photo' : 'Upload photo'}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="sr-only"
          />
          </label>
          {newItem.imageUrl && (
            <div className="sm:col-span-2 flex items-center gap-3">
              <img
                src={newItem.imageUrl}
                alt={`${newItem.name || 'Food item'} photo preview`}
                className="h-20 w-20 rounded-xl border border-slate-600 object-cover"
              />
              <span className="text-xs text-slate-400">Current photo preview</span>
              <button
                type="button"
                onClick={() => setNewItem({ ...newItem, imageUrl: '' })}
                className="ml-auto text-xs font-bold text-rose-300 hover:text-rose-200"
              >
                Remove image
              </button>
            </div>
          )}
        </div>
        <label className="md:col-span-2 flex items-center gap-3 text-sm font-semibold text-slate-200">
          <input
            type="checkbox"
            checked={newItem.available !== false}
            onChange={(event) => setNewItem({ ...newItem, available: event.target.checked })}
            className="h-4 w-4 accent-amber-500"
          />
          Available to order
        </label>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold py-3 px-5 rounded-xl transition text-sm cursor-pointer"
          >
            {isSaving ? 'Saving...' : initialItem ? 'Save Changes' : 'Add Item To Menu'}
          </button>
          {initialItem && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-5 rounded-xl transition text-sm"
            >
              Cancel
            </button>
          )}
        </div>
        {imageError && <p className="md:col-span-2 text-sm text-rose-300">{imageError}</p>}
        {submitError && <p role="alert" className="md:col-span-2 text-sm font-semibold text-rose-300">{submitError}</p>}
      </form>
    </div>
  );
}