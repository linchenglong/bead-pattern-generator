'use client';

export type BrandId = 'artkal' | 'perler' | 'hama';

export interface BeadConfig {
  width: number;
  height: number;
  maxColors: number;
  dithering: boolean;
  colorMode: 'color' | 'grayscale' | 'bw';
  useFullPalette: boolean;
  isCustomSize: boolean;
  selectedBrand: BrandId;
}

interface ConfigPanelProps {
  config: BeadConfig;
  onChange: (config: BeadConfig) => void;
  imageAspectRatio?: number;
  disabled?: boolean;
  totalPaletteColors?: number;
}

const SIZE_PRESETS = [
  { label: '小 29×29', w: 29, h: 29 },
  { label: '中 50×50', w: 50, h: 50 },
  { label: '大 80×80', w: 80, h: 80 },
  { label: '超大 120×120', w: 120, h: 120 },
  { label: '自定义', w: 0, h: 0 },
];

const BRAND_OPTIONS: { id: BrandId; label: string }[] = [
  { id: 'artkal', label: 'Artkal' },
  { id: 'perler', label: 'Perler' },
  { id: 'hama', label: 'Hama' },
];

const COLOR_LIMITS = [
  { label: '8 色', value: 8 },
  { label: '16 色', value: 16 },
  { label: '32 色', value: 32 },
  { label: '64 色', value: 64 },
  { label: '全色板', value: 0 },
];

export default function ConfigPanel({ config, onChange, imageAspectRatio, disabled, totalPaletteColors }: ConfigPanelProps) {
  const update = (partial: Partial<BeadConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handlePresetChange = (preset: (typeof SIZE_PRESETS)[0]) => {
    if (preset.w === 0) {
      update({ isCustomSize: true });
    } else {
      if (imageAspectRatio && imageAspectRatio !== 1) {
        const w = preset.w;
        const h = Math.round(w / imageAspectRatio);
        update({ width: w, height: Math.max(1, h), isCustomSize: false });
      } else {
    update({ width: preset.w, height: preset.h, isCustomSize: false });
      }
    }
  };

  const isPresetActive = (p: (typeof SIZE_PRESETS)[0]) => {
    if (p.w === 0) return config.isCustomSize;
    return !config.isCustomSize && p.w === config.width && p.h === config.height;
  };

  return (
    <div className="card p-5 space-y-5">
      {/* 尺寸 */}
      <div className="space-y-2.5">
     <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">图纸尺寸</label>
        <div className="flex flex-wrap gap-2">
          {SIZE_PRESETS.map((p) => (
        <button
           key={p.label}
         onClick={() => handlePresetChange(p)}
         disabled={disabled}
     className={`chip ${isPresetActive(p) ? 'chip-active' : 'chip-inactive'}`}
            >
       {p.label}
          </button>
          ))}
     </div>

        {config.isCustomSize && (
          <div className="flex items-center gap-2 mt-2 animate-slide-down">
     <input
     type="number"
          min={5}
       max={200}
value={config.width}
     onChange={(e) => update({ width: Math.max(5, Number(e.target.value)) })}
   disabled={disabled}
      className="w-20 px-3 py-1.5 border border-warm-border rounded-lg text-center text-sm bg-white focus:border-terracotta focus:outline-none transition-colors"
      />
            <span className="text-warm-300 text-sm font-medium">&times;</span>
  <input
        type="number"
              min={5}
              max={200}
       value={config.height}
              onChange={(e) => update({ height: Math.max(5, Number(e.target.value)) })}
       disabled={disabled}
  className="w-20 px-3 py-1.5 border border-warm-border rounded-lg text-center text-sm bg-white focus:border-terracotta focus:outline-none transition-colors"
    />
        <span className="text-xs text-warm-400">颗</span>
    </div>
 )}
      </div>

      {/* 品牌色板 - 单选 */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">
          拼豆品牌
          {totalPaletteColors != null && (
    <span className="text-warm-300 font-normal ml-2">(共 {totalPaletteColors} 色)</span>
      )}
</label>
        <div className="flex flex-wrap gap-2">
          {BRAND_OPTIONS.map((brand) => (
            <button
        key={brand.id}
   onClick={() => update({ selectedBrand: brand.id })}
       disabled={disabled}
       className={`chip ${config.selectedBrand === brand.id ? 'chip-active' : 'chip-inactive'}`}
         >
           {brand.label}
  </button>
          ))}
     </div>
   </div>

      {/* 颜色模式 */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">颜色模式</label>
        <div className="flex gap-2">
          {([
{ label: '彩色', value: 'color' as const },
            { label: '灰度', value: 'grayscale' as const },
 { label: '黑白', value: 'bw' as const },
        ]).map((m) => (
            <button
          key={m.value}
   onClick={() => update({ colorMode: m.value })}
      disabled={disabled}
    className={`chip ${config.colorMode === m.value ? 'chip-active' : 'chip-inactive'}`}
            >
              {m.label}
     </button>
          ))}
        </div>
      </div>

      {/* 颜色数量 */}
    <div className="space-y-2.5">
        <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">最大颜色数</label>
        <div className="flex flex-wrap gap-2">
     {COLOR_LIMITS.map((cl) => (
     <button
              key={cl.value}
    onClick={() => update({ maxColors: cl.value })}
  disabled={disabled}
         className={`chip ${config.maxColors === cl.value ? 'chip-active' : 'chip-inactive'}`}
            >
              {cl.label}
          </button>
          ))}
        </div>
      </div>

      {/* 抖动 & 色板 */}
      <div className="flex flex-wrap gap-5 pt-4 border-t border-warm-border">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
       <input
            type="checkbox"
       checked={config.dithering}
        onChange={(e) => update({ dithering: e.target.checked })}
         disabled={disabled}
     />
          <span className="text-warm-600 text-xs">Floyd-Steinberg 抖动</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
       <input
         type="checkbox"
        checked={config.useFullPalette}
            onChange={(e) => update({ useFullPalette: e.target.checked })}
            disabled={disabled}
          />
 <span className="text-warm-600 text-xs">含特殊色（荧光/夜光/透明）</span>
     </label>
   </div>
 </div>
  );
}
