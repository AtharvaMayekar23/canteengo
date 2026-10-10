import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { getFoodImage } from '../utils/foodCatalog';

export default function FoodPhoto({ item, className }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getFoodImage(item);

  if (!imageUrl || imageFailed) {
    return (
      <div className={`${className} bg-slate-100 text-slate-400 flex flex-col items-center justify-center gap-2`}>
        <UtensilsCrossed size={30} strokeWidth={1.7} aria-hidden="true" />
        <span className="text-xs font-semibold">No photo</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={item.name}
      onError={() => setImageFailed(true)}
      className={className}
    />
  );
}