'use client';

import { useEffect, useRef, useState } from 'react';
import type { QuantizeResult } from '@/lib/quantize';
import { renderPixelPreview, renderGridPattern } from '@/lib/grid-renderer';

interface BeadPreviewProps {
  result: QuantizeResult | null;
  loading?: boolean;
}

export default function BeadPreview({ result, loading }: BeadPreviewProps) {
  const pixelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'pixel' | 'grid'>('pixel');

  useEffect(() => {
    if (!result) return;

    if (viewMode === 'pixel' && pixelRef.current) {
      pixelRef.current.innerHTML = '';
      const scale = Math.min(400 / result.width, 400 / result.height, 15);
      const canvas = renderPixelPreview(result, Math.max(2, Math.floor(scale)));
      canvas.style.width = '100%';
      canvas.style.maxWidth = `${result.width * Math.max(2, Math.floor(scale))}px`;
      canvas.style.imageRendering = 'pixelated';
      canvas.className = 'rounded-lg shadow-md mx-auto';
      pixelRef.current.appendChild(canvas);
    }

    if (viewMode === 'grid' && gridRef.current) {
      gridRef.current.innerHTML = '';
      const cellSize = Math.max(20, Math.min(40, Math.floor(600 / Math.max(result.width, result.height))));
      const canvas = renderGridPattern(result, { cellSize, showLabels: cellSize >= 20 });
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.className = 'rounded-lg shadow-md mx-auto';
      gridRef.current.appendChild(canvas);
    }
  }, [result, viewMode]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-500">正在生成拼豆图纸...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        <div className="text-4xl mb-3">🧩</div>
        <p>上传图片并点击生成后，预览将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">👀 预览</h3>
        <div className="flex bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => setViewMode('pixel')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              viewMode === 'pixel' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'
            }`}
          >
            像素图
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500'
            }`}
          >
            网格图纸
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        {result.width} × {result.height} | {result.usedColors.length} 种颜色 | {result.totalBeads} 颗豆子
      </div>

      <div className="overflow-auto max-h-[500px]">
        <div ref={pixelRef} className={viewMode === 'pixel' ? '' : 'hidden'} />
        <div ref={gridRef} className={viewMode === 'grid' ? '' : 'hidden'} />
      </div>
    </div>
  );
}
