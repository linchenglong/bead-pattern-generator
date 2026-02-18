'use client';

import type { QuantizeResult } from '@/lib/quantize';
import type { BeadColor } from '@/lib/palette-registry';

interface MaterialListProps {
  result: QuantizeResult | null;
}

export default function MaterialList({ result }: MaterialListProps) {
  if (!result) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-terracotta" />
          <h3 className="text-sm font-semibold text-charcoal">用料清单</h3>
        </div>
  <div className="flex items-center gap-2 text-xs text-warm-400">
          <span className="font-mono text-terracotta font-semibold">{result.usedColors.length}</span> 种颜色
        <span className="w-1 h-1 rounded-full bg-warm-300" />
     <span className="font-mono text-terracotta font-semibold">{result.totalBeads}</span> 颗
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-lg">
        <table className="material-table">
          <thead>
     <tr>
     <th>颜色</th>
       <th>品牌</th>
    <th>色号</th>
       <th>名称</th>
    <th style={{ textAlign: 'right' }}>数量</th>
       </tr>
          </thead>
          <tbody>
         {result.usedColors.map((color: BeadColor) => {
         const count = result.colorStats.get(color.uid) || 0;
   const pct = ((count / result.totalBeads) * 100).toFixed(1);
  return (
 <tr key={color.uid}>
    <td>
                  <div
             className="w-5 h-5 rounded"
      style={{
               backgroundColor: color.hex,
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
       }}
       />
    </td>
  <td>
         <span className="font-mono text-xs text-warm-400">{color.brand}</span>
        </td>
   <td>
         <span className="font-mono text-xs text-warm-600">{color.code}</span>
                  </td>
       <td>
           <span className="text-xs text-charcoal">{color.name}</span>
                </td>
       <td>
       <span className="font-mono text-xs font-medium text-charcoal">{count}</span>
              <span className="text-warm-300 ml-1 text-xs">({pct}%)</span>
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
