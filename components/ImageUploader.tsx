'use client';

import { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
}

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
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
       dragActive
      ? 'border-pink-400 bg-pink-50'
        : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50/30'
        }`}
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

        {preview ? (
          <div className="space-y-4">
 <img
       src={preview}
      alt="预览"
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-500">点击或拖拽更换图片</p>
</div>
        ) : (
          <div className="space-y-4 py-8">
            <div className="text-5xl">📷</div>
            <div>
        <p className="text-lg font-medium text-gray-700">
          点击上传或拖拽图片到这里
            </p>
       <p className="text-sm text-gray-400 mt-1">
                支持 JPG、PNG、WebP 格式
      </p>
      </div>
          </div>
        )}
      </div>
    </div>
  );
}
