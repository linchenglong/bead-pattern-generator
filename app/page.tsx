'use client';

import { useState, useCallback, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ImageGallery from '@/components/ImageGallery';
import ConfigPanel, { type BeadConfig } from '@/components/ConfigPanel';
import BeadPreview from '@/components/BeadPreview';
import MaterialList from '@/components/MaterialList';
import RedeemDialog from '@/components/RedeemDialog';
import DownloadButton from '@/components/DownloadButton';
import { quantizeImage, type QuantizeResult } from '@/lib/quantize';
import { ARTKAL_PALETTE, ARTKAL_SOLID_PALETTE } from '@/lib/artkal-palette';
import { BRAND_PALETTE_MAP } from '@/lib/brand-palettes';

const DEFAULT_CONFIG: BeadConfig = {
  width: 58,
  height: 58,
  maxColors: 16,
  dithering: false,
  colorMode: 'color',
  useFullPalette: false,
  brandPalettes: [],
};

export default function Home() {
  const [config, setConfig] = useState<BeadConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<QuantizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>();
  const [imageTab, setImageTab] = useState<'upload' | 'gallery'>('upload');
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    imageRef.current = img;
    const ratio = img.naturalWidth / img.naturalHeight;
    setImageAspectRatio(ratio);

    if (ratio > 1) {
      setConfig((prev) => ({
        ...prev,
        height: Math.max(1, Math.round(prev.width / ratio)),
 }));
    } else {
      setConfig((prev) => ({
     ...prev,
        width: Math.max(1, Math.round(prev.height * ratio)),
      }));
    }
    setResult(null);
  }, []);

  const buildMergedPalette = useCallback(() => {
    const base = config.useFullPalette ? ARTKAL_PALETTE : ARTKAL_SOLID_PALETTE;
    if (!config.brandPalettes || config.brandPalettes.length === 0) {
      return base;
  }
    const hexSet = new Set(base.map((c) => c.hex));
    const merged = [...base];
    for (const pid of config.brandPalettes) {
      const bp = BRAND_PALETTE_MAP.get(pid);
      if (bp) {
        for (const color of bp.colors) {
      if (!hexSet.has(color.hex)) {
            hexSet.add(color.hex);
            merged.push(color);
        }
        }
      }
    }
    return merged;
  }, [config.useFullPalette, config.brandPalettes]);

  const handleGenerate = useCallback(async () => {
    if (!imageRef.current) {
 alert('请先上传图片');
      return;
    }

    const token = localStorage.getItem('bead_token');
    try {
      const checkRes = await fetch('/api/check-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
      });
      const checkData = await checkRes.json();
      if (!checkData.allowed) {
        setShowRedeem(true);
        return;
      }
    } catch {
      console.warn('Usage check failed, allowing...');
    }

    setLoading(true);
    try {
      const palette = buildMergedPalette();
      const quantizeResult = await quantizeImage(imageRef.current, {
        ...config,
        palette,
 });
setResult(quantizeResult);
    } catch (err) {
      console.error('Quantize error:', err);
      alert('图片处理失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [config, buildMergedPalette]);

  const handleRedeemSuccess = useCallback((token: string) => {
    setShowRedeem(false);
    localStorage.setItem('bead_token', token);
 handleGenerate();
  }, [handleGenerate]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <header className="text-center py-8 px-4">
  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          🫘 拼豆图纸生成器
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
          上传照片或选择素材，一键生成拼豆图纸
 </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* 图片来源选项卡 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
         <div className="flex gap-2 mb-4">
  <button
  onClick={() => setImageTab('upload')}
         className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
   imageTab === 'upload'
  ? 'bg-pink-500 text-white shadow-sm'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
      >
          📷 上传图片
  </button>
      <button
      onClick={() => setImageTab('gallery')}
           className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
    imageTab === 'gallery'
        ? 'bg-pink-500 text-white shadow-sm'
      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
            >
    🖼️ 精选素材
     </button>
       </div>

              {imageTab === 'upload' ? (
          <ImageUploader onImageLoad={handleImageLoad} />
  ) : (
  <ImageGallery onImageLoad={handleImageLoad} disabled={loading} />
      )}
            </div>

     <ConfigPanel
  config={config}
          onChange={setConfig}
 imageAspectRatio={imageAspectRatio}
 disabled={loading}
       />

      <button
     onClick={handleGenerate}
              disabled={loading || !imageRef.current}
       className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold rounded-2xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
     >
     {loading ? '⏳ 生成中...' : '✨ 生成拼豆图纸'}
            </button>
          </div>

          <div className="space-y-6">
<BeadPreview result={result} loading={loading} />
            <MaterialList result={result} />
            <DownloadButton result={result} />
          </div>
    </div>
      </div>

      <RedeemDialog
  open={showRedeem}
        onClose={() => setShowRedeem(false)}
 onSuccess={handleRedeemSuccess}
      />

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
 <p>拼豆图纸生成器 — 让每颗豆子都到位 ❤️</p>
     <p className="mt-1">色板仅供参考，实际颜色以实物为准</p>
      </footer>
 </main>
  );
}
