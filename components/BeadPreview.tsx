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
      canvas.style.maxWidth = result.width * Math.max(2, Math.floor(scale)) + 'px';
      canvas.style.imageRendering = 'pixelated';
      canvas.className = 'rounded-xl mx-auto';
   canvas.style.boxShadow = '0 4px 20px rgba(42,39,36,0.08)';
      pixelRef.current.appendChild(canvas);
    }

    if (viewMode === 'grid' && gridRef.current) {
      gridRef.current.innerHTML = '';
  const cellSize = Math.max(20, Math.min(40, Math.floor(600 / Math.max(result.width, result.height))));
      const canvas = renderGridPattern(result, { cellSize, showLabels: cellSize >= 20 });
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.className = 'rounded-xl mx-auto';
      canvas.style.boxShadow = '0 4px 20px rgba(42,39,36,0.08)';
      gridRef.current.appendChild(canvas);
    }
  }, [result, viewMode]);

  if (loading) {
    return (
      <div className="card p-10 text-center min-h-[260px] flex flex-col items-center justify-center">
        <div className="bead-loader mb-5">
          <span /><span /><span /><span /><span />
        </div>
    <p className="text-warm-400 text-sm">正在生成拼豆图纸...</p>
      </div>
    );
  }

  if (!result) {
 return (
      <div className="card p-10 text-center min-h-[260px] flex flex-col items-center justify-center">
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(7)].map((_, i) => (
         <div
       key={i}
       className="w-4 h-4 rounded-full"
     style={{
    backgroundColor: i % 3 === 0 ? '#BF5540' : i % 3 === 1 ? '#5A8A63' : '#D1C9BF',
opacity: 0.3 + (i % 3) * 0.15,
       }}
            />
          ))}
        </div>
        <p className="text-warm-400 text-sm">上传图片并点击生成后，预览将显示在这里</p>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-sage" />
          <h3 className="text-sm font-semibold text-charcoal">预览</h3>
     </div>
        <div className="tab-bar">
          <button
            onClick={() => setViewMode('pixel')}
            className={viewMode === 'pixel' ? 'active' : ''}
 >
            像素图
   </button>
          <button
 onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
          >
  网格图纸
          </button>
     </div>
   </div>

      <div className="flex items-center justify-center gap-3 text-xs text-warm-400 py-1">
        <span className="font-mono">{result.width} &times; {result.height}</span>
        <span className="w-1 h-1 rounded-full bg-warm-300" />
        <span>{result.usedColors.length} 种颜色</span>
        <span className="w-1 h-1 rounded-full bg-warm-300" />
  <span>{result.totalBeads} 颗</span>
      </div>

      <div className="overflow-auto max-h-[500px] rounded-xl bg-cream-dark/30 p-3">
        <div ref={pixelRef} className={viewMode === 'pixel' ? '' : 'hidden'} />
     <div ref={gridRef} className={viewMode === 'grid' ? '' : 'hidden'} />
    </div>
    </div>
  );
}
