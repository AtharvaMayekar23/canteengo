import { Pencil, Trash2 } from 'lucide-react';
import FoodPhoto from './FoodPhoto';

export default function FoodCard({ item, onDelete, onEdit, isAdmin = false }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <FoodPhoto item={item} className="w-full aspect-[4/3] object-cover rounded-xl mb-4" />
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
          <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-semibold rounded-full">
            {item.category}
          </span>
        </div>
        <p className="text-slate-500 text-xs mb-3">{item.description}</p>
        <p className="text-xl font-black text-slate-900 mb-2">₹{item.price}</p>
        <span className={`text-xs font-bold ${item.available ? 'text-emerald-600' : 'text-rose-600'}`}>
          {item.available ? '● Available' : '● Out of Stock'}
        </span>
      </div>

      {isAdmin ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(item)}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs transition"
          >
            <Pencil size={14} aria-hidden="true" /> Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 rounded-xl text-xs transition border border-rose-200"
          >
            <Trash2 size={14} aria-hidden="true" /> Delete
          </button>
        </div>
      ) : (
        <button
          disabled={!item.available}
          className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition ${
            item.available
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}