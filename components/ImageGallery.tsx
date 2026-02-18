'use client';

import { useState, useCallback } from 'react';
import { IMAGE_CATEGORIES, type BuiltInImage } from '@/lib/builtin-images';

interface ImageGalleryProps {
  onImageLoad: (img: HTMLImageElement) => void;
  disabled?: boolean;
}

export default function ImageGallery({ onImageLoad, disabled }: ImageGalleryProps) {
  const [activeCategory, setActiveCategory] = useState(IMAGE_CATEGORIES[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(
    (image: BuiltInImage) => {
      if (disabled || loading) return;
      setSelectedId(image.id);
   setLoading(true);

  const img = new Image();
      img.crossOrigin = 'anonymous';
 img.onload = () => {
        setLoading(false);
      onImageLoad(img);
      };
      img.onerror = () => {
  setLoading(false);
     setSelectedId(null);
        alert('\u56fe\u7247\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5\u6216\u9009\u62e9\u5176\u4ed6\u56fe\u7247');
    };
      img.src = image.url;
    },
    [onImageLoad, disabled, loading],
  );

  const currentCategory =
 IMAGE_CATEGORIES.find((c) => c.id === activeCategory) || IMAGE_CATEGORIES[0];

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        {IMAGE_CATEGORIES.map((cat) => (
      <button
  key={cat.id}
    onClick={() => setActiveCategory(cat.id)}
     disabled={disabled}
   className={`chip ${activeCategory === cat.id ? 'chip-active' : 'chip-inactive'}`}
          >
      {cat.icon} {cat.name}
          </button>
        ))}
   </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto p-0.5">
   {currentCategory.images.map((image) => {
          const isSelected = selectedId === image.id;
    return (
            <button
   key={image.id}
     onClick={() => handleSelect(image)}
         disabled={disabled || loading}
  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-[1.03] ${
             isSelected
      ? 'border-terracotta ring-2 ring-terracotta/30'
             : 'border-transparent hover:border-terracotta/40'
     }`}
   >
  <img
       src={image.thumb}
        alt={image.name}
   crossOrigin="anonymous"
         className="w-full h-full object-cover"
     loading="lazy"
   />
           {isSelected && loading && (
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
  )}
  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
          <span className="text-[10px] text-white leading-tight">{image.name}</span>
 </div>
      </button>
          );
        })}
      </div>
    </div>
  );
}
