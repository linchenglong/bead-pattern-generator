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

  const handleSelect = useCallback((image: BuiltInImage) => {
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
      alert('图片加载失败，请重试或选择其他图片');
    };
    img.src = image.url;
  }, [onImageLoad, disabled, loading]);

  const currentCategory = IMAGE_CATEGORIES.find(c => c.id === activeCategory) || IMAGE_CATEGORIES[0];

  return (
    <div className="space-y-4">
    {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {IMAGE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
  onClick={() => setActiveCategory(cat.id)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
          activeCategory === cat.id
        ? 'bg-pink-500 text-white shadow-sm'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
          >
         {cat.icon} {cat.name}
          </button>
        ))}
      </div>

    {/* Image grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto p-1">
        {currentCategory.images.map((image) => (
          <button
            key={image.id}
   onClick={() => handleSelect(image)}
 disabled={disabled || loading}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
           selectedId === image.id
       ? 'border-pink-500 ring-2 ring-pink-300'
      : 'border-transparent hover:border-pink-300'
     }`}
  >
   <img
       src={image.thumb}
       alt={image.name}
        crossOrigin="anonymous"
     className="w-full h-full object-cover"
   loading="lazy"
            />
      {selectedId === image.id && loading && (
  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
         </div>
        )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1 py-0.5">
       <span className="text-[10px] text-white leading-tight">{image.name}</span>
 </div>
          </button>
        ))}
      </div>
    </div>
  );
}
