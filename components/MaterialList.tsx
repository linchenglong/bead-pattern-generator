'use client';

import type { QuantizeResult } from '@/lib/quantize';
import type { ArtkalColor } from '@/lib/artkal-palette';

interface MaterialListProps {
  result: QuantizeResult | null;
}

export default function MaterialList({ result }: MaterialListProps) {
  if (!result) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <h3 className="text-lg font-bold text-gray-800 mb-4">📋 用料清单</h3>

      <div className="text-sm text-gray-500 mb-3">
        共 <span className="font-bold text-pink-600">{result.usedColors.length}</span> 种颜色，
 <span className="font-bold text-pink-600">{result.totalBeads}</span> 颗豆子
      </div>

    <div className="max-h-80 overflow-y-auto">
    <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
        <tr className="text-left text-gray-400 border-b">
     <th className="py-2 pl-2">颜色</th>
      <th className="py-2">色号</th>
    <th className="py-2">名称</th>
    <th className="py-2 text-right pr-2">数量</th>
 </tr>
      </thead>
          <tbody>
      {result.usedColors.map((color: ArtkalColor) => {
              const count = result.colorStats.get(color.code) || 0;
     const pct = ((count / result.totalBeads) * 100).toFixed(1);
           return (
          <tr key={color.code} className="border-b border-gray-50 hover:bg-gray-50">
 <td className="py-1.5 pl-2">
        <div
 className="w-6 h-6 rounded border border-gray-200"
           style={{ backgroundColor: color.hex }}
 />
      </td>
       <td className="py-1.5 font-mono text-gray-700">{color.code}</td>
 <td className="py-1.5 text-gray-600">{color.name}</td>
        <td className="py-1.5 text-right pr-2">
         <span className="font-medium text-gray-800">{count}</span>
               <span className="text-gray-400 ml-1 text-xs">({pct}%)</span>
         </td>
      </tr>
       );
   })}
 </tbody>
        </table>
      </div>
 </div>
  );
}
