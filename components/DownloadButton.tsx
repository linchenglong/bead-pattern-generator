'use client';

import { useState } from 'react';
import type { QuantizeResult } from '@/lib/quantize';
import { renderGridPattern, canvasToBlob, generateMaterialText } from '@/lib/grid-renderer';

interface DownloadButtonProps {
  result: QuantizeResult | null;
}

export default function DownloadButton({ result }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  if (!result) return null;

  const downloadGridPNG = async () => {
  setDownloading(true);
    try {
   const canvas = renderGridPattern(result, {
cellSize: 50,
        showLabels: true,
        showGridLines: true,
        showRowColNumbers: true,
      });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bead-pattern-${result.width}x${result.height}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const downloadMaterialList = () => {
    const text = generateMaterialText(result);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
    a.href = url;
    a.download = `bead-materials-${result.width}x${result.height}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
onClick={downloadGridPNG}
   disabled={downloading}
        className="btn-primary flex-1 min-w-[140px] px-5 py-3 text-sm"
   >
 {downloading ? '导出中...' : '下载图纸 PNG'}
      </button>
      <button
        onClick={downloadMaterialList}
        className="btn-secondary flex-1 min-w-[140px] px-5 py-3 text-sm"
 >
  下载用料清单
      </button>
    </div>
  );
}
