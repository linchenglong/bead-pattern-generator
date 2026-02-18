'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
}

const BEAD_COLORS = ['#BF5540', '#5A8A63', '#D1C9BF', '#E8A849', '#6B8F9E'];

export default function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
   }
      const url = URL.createObjectURL(file);
      setPreview(url);

   const img = new Image();
      img.onload = () => onImageLoad(img, file);
      img.src = url;
    },
    [onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files[0]) {
    handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        className={`upload-zone p-6 text-center min-h-[260px] flex flex-col items-center justify-center ${
 dragActive ? 'drag-active' : ''
        } ${preview ? 'has-image' : ''}`}
        onDragOver={(e) => {
      e.preventDefault();
       setDragActive(true);
      }}
        onDragLeave={() => setDragActive(false)}
     onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
       ref={inputRef}
  type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="relative z-10">
          {preview ? (
         <div className="space-y-3">
              <img
                src={preview}
              alt="预览"
  className="max-h-56 mx-auto rounded-xl"
     style={{ boxShadow: '0 4px 20px rgba(42,39,36,0.1)' }}
   />
      <p className="text-warm-400 text-xs">点击或拖拽更换图片</p>
       </div>
  ) : (
<div className="space-y-3 py-6">
        {/* Decorative pegboard mini grid */}
      <div className="flex justify-center gap-1.5 mb-2">
     {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
   {[...Array(3)].map((_, j) => (
          <div
 key={j}
         className="w-2.5 h-2.5 rounded-full"
          style={{
        backgroundColor: BEAD_COLORS[(i + j) % BEAD_COLORS.length],
       opacity: 0.35 + ((i * 3 + j) % 5) * 0.12,
         }}
 />
     ))}
      </div>
       ))}
</div>
           <div>
         <p className="text-sm font-medium text-charcoal">
               点击上传或拖拽图片到这里
    </p>
   <p className="text-xs text-warm-400 mt-1">
     支持 JPG、PNG、WebP 格式
      </p>
  </div>
</div>
          )}
        </div>
      </div>
    </div>
  );
}
