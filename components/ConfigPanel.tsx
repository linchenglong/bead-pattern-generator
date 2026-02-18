'use client';

export interface BeadConfig {
  width: number;
  height: number;
  maxColors: number;
  dithering: boolean;
  colorMode: 'color' | 'grayscale' | 'bw';
  useFullPalette: boolean;
}

interface ConfigPanelProps {
  config: BeadConfig;
  onChange: (config: BeadConfig) => void;
  imageAspectRatio?: number;
  disabled?: boolean;
}

const SIZE_PRESETS = [
  { label: '小 (29×29)', w: 29, h: 29 },
  { label: '中 (39×39)', w: 39, h: 39 },
  { label: '大 (58×58)', w: 58, h: 58 },
  { label: '自定义', w: 0, h: 0 },
];

const COLOR_LIMITS = [
  { label: '8 色', value: 8 },
{ label: '16 色', value: 16 },
  { label: '32 色', value: 32 },
  { label: '64 色', value: 64 },
  { label: '全色板', value: 0 },
];

export default function ConfigPanel({ config, onChange, imageAspectRatio, disabled }: ConfigPanelProps) {
  const isCustomSize = !SIZE_PRESETS.slice(0, -1).some(
    (p) => p.w === config.width && p.h === config.height
  );

  const update = (partial: Partial<BeadConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handlePresetChange = (preset: (typeof SIZE_PRESETS)[0]) => {
    if (preset.w > 0) {
      if (imageAspectRatio && imageAspectRatio !== 1) {
        const w = preset.w;
   const h = Math.round(w / imageAspectRatio);
        update({ width: w, height: Math.max(1, h) });
      } else {
        update({ width: preset.w, height: preset.h });
   }
    }
  };

return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
   <h3 className="text-lg font-bold text-gray-800">⚙️ 参数配置</h3>

      {/* 尺寸 */}
      <div className="space-y-2">
  <label className="text-sm font-medium text-gray-600">图纸尺寸</label>
     <div className="flex flex-wrap gap-2">
 {SIZE_PRESETS.map((p) => {
   const isActive = p.w === 0
  ? isCustomSize
              : p.w === config.width && p.h === config.height;
   return (
              <button
      key={p.label}
     onClick={() => handlePresetChange(p)}
            disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
  isActive
  ? 'bg-pink-500 text-white shadow-sm'
             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        >
     {p.label}
         </button>
    );
          })}
        </div>

        {isCustomSize && (
          <div className="flex items-center gap-2 mt-2">
  <input
              type="number"
           min={5}
     max={200}
      value={config.width}
      onChange={(e) => update({ width: Math.max(5, Number(e.target.value)) })}
  disabled={disabled}
              className="w-20 px-2 py-1 border rounded-lg text-center text-sm"
            />
          <span className="text-gray-400">×</span>
       <input
       type="number"
      min={5}
         max={200}
         value={config.height}
         onChange={(e) => update({ height: Math.max(5, Number(e.target.value)) })}
              disabled={disabled}
          className="w-20 px-2 py-1 border rounded-lg text-center text-sm"
  />
            <span className="text-xs text-gray-400">颗</span>
          </div>
   )}
      </div>

      {/* 颜色模式 */}
   <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">颜色模式</label>
        <div className="flex gap-2">
       {([
            { label: '🎨 彩色', value: 'color' as const },
            { label: '🌫️ 灰度', value: 'grayscale' as const },
  { label: '⬛ 黑白', value: 'bw' as const },
 ]).map((m) => (
            <button
   key={m.value}
        onClick={() => update({ colorMode: m.value })}
      disabled={disabled}
    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
          config.colorMode === m.value
       ? 'bg-pink-500 text-white shadow-sm'
   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
 >
 {m.label}
            </button>
          ))}
 </div>
      </div>

      {/* 颜色数量 */}
      <div className="space-y-2">
    <label className="text-sm font-medium text-gray-600">最大颜色数</label>
    <div className="flex flex-wrap gap-2">
          {COLOR_LIMITS.map((cl) => (
   <button
              key={cl.value}
   onClick={() => update({ maxColors: cl.value })}
              disabled={disabled}
      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
    config.maxColors === cl.value
           ? 'bg-pink-500 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
         }`}
   >
           {cl.label}
            </button>
          ))}
        </div>
      </div>

      {/* 抖动 & 色板 */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
<input
            type="checkbox"
            checked={config.dithering}
  onChange={(e) => update({ dithering: e.target.checked })}
            disabled={disabled}
    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400"
          />
          <span className="text-gray-600">Floyd-Steinberg 抖动</span>
  </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
type="checkbox"
    checked={config.useFullPalette}
            onChange={(e) => update({ useFullPalette: e.target.checked })}
    disabled={disabled}
    className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400"
      />
     <span className="text-gray-600">含特殊色（荧光/夜光/透明）</span>
        </label>
      </div>
    </div>
  );
}
