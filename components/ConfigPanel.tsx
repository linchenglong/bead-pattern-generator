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
  selectedBrands: BrandId[];
}

interface ConfigPanelProps {
  config: BeadConfig;
  onChange: (config: BeadConfig) => void;
  imageAspectRatio?: number;
  disabled?: boolean;
  totalPaletteColors?: number;
}

const SIZE_PRESETS = [
  { label: '\u5c0f 29\u00d729', w: 29, h: 29 },
  { label: '\u4e2d 50\u00d750', w: 50, h: 50 },
  { label: '\u5927 80\u00d780', w: 80, h: 80 },
  { label: '\u8d85\u5927 120\u00d7120', w: 120, h: 120 },
  { label: '\u81ea\u5b9a\u4e49', w: 0, h: 0 },
];

const BRAND_OPTIONS: { id: BrandId; label: string }[] = [
  { id: 'artkal', label: 'Artkal' },
  { id: 'perler', label: 'Perler' },
  { id: 'hama', label: 'Hama' },
];

const COLOR_LIMITS = [
  { label: '8 \u8272', value: 8 },
  { label: '16 \u8272', value: 16 },
  { label: '32 \u8272', value: 32 },
  { label: '64 \u8272', value: 64 },
  { label: '\u5168\u8272\u677f', value: 0 },
];

export default function ConfigPanel({
  config,
  onChange,
  imageAspectRatio,
  disabled,
  totalPaletteColors,
}: ConfigPanelProps) {
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

  const handleBrandToggle = (brandId: BrandId) => {
    const current = config.selectedBrands;
    if (current.includes(brandId)) {
      if (current.length > 1) {
        update({ selectedBrands: current.filter((b) => b !== brandId) });
      }
    } else {
      update({ selectedBrands: [...current, brandId] });
    }
  };

  const isPresetActive = (p: (typeof SIZE_PRESETS)[0]) => {
    if (p.w === 0) return config.isCustomSize;
    if (config.isCustomSize) return false;
    return p.w === config.width;
  };

  return (
    <div className="card p-5 space-y-5">
    {/* \u5c3a\u5bf8 */}
      <div className="space-y-2.5">
     <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">\u56fe\u7eb8\u5c3a\u5bf8</label>
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
            <span className="text-xs text-warm-400">\u9897</span>
      </div>
        )}
      </div>

  {/* \u54c1\u724c\u8272\u677f */}
      <div className="space-y-2.5">
 <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">
   \u62fc\u8c46\u54c1\u724c
          {totalPaletteColors != null && (
         <span className="text-warm-300 font-normal ml-2">
         (\u5171 {totalPaletteColors} \u8272)
       </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {BRAND_OPTIONS.map((brand) => {
      const isSelected = config.selectedBrands.includes(brand.id);
        return (
       <button
 key={brand.id}
  onClick={() => handleBrandToggle(brand.id)}
       disabled={disabled}
  className={`chip ${isSelected ? 'chip-active' : 'chip-inactive'}`}
        >
          {brand.label}
        </button>
      );
          })}
        </div>
      </div>

      {/* \u989c\u8272\u6a21\u5f0f */}
      <div className="space-y-2.5">
 <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">\u989c\u8272\u6a21\u5f0f</label>
        <div className="flex gap-2">
   {([
    { label: '\u5f69\u8272', value: 'color' as const },
         { label: '\u7070\u5ea6', value: 'grayscale' as const },
       { label: '\u9ed1\u767d', value: 'bw' as const },
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

      {/* \u989c\u8272\u6570\u91cf */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-warm-400 uppercase tracking-wider">\u6700\u5927\u989c\u8272\u6570</label>
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

    {/* \u6296\u52a8 & \u8272\u677f */}
  <div className="flex flex-wrap gap-5 pt-4 border-t border-warm-border">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
          <input
     type="checkbox"
     checked={config.dithering}
            onChange={(e) => update({ dithering: e.target.checked })}
            disabled={disabled}
          />
   <span className="text-warm-600 text-xs">Floyd-Steinberg \u6296\u52a8</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer">
  <input
            type="checkbox"
    checked={config.useFullPalette}
    onChange={(e) => update({ useFullPalette: e.target.checked })}
            disabled={disabled}
      />
          <span className="text-warm-600 text-xs">\u542b\u7279\u6b8a\u8272\uff08\u8367\u5149/\u591c\u5149/\u900f\u660e\uff09</span>
        </label>
      </div>
    </div>
  );
}
