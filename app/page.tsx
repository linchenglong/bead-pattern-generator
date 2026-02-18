'use client';

import { useState, useCallback, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ConfigPanel, { type BeadConfig } from '@/components/ConfigPanel';
import BeadPreview from '@/components/BeadPreview';
import MaterialList from '@/components/MaterialList';
import RedeemDialog from '@/components/RedeemDialog';
import DownloadButton from '@/components/DownloadButton';
import { quantizeImage, type QuantizeResult } from '@/lib/quantize';

const DEFAULT_CONFIG: BeadConfig = {
  width: 50,
  height: 50,
  maxColors: 16,
  dithering: false,
  colorMode: 'color',
  useFullPalette: false,
  isCustomSize: false,
  selectedBrands: ['artkal'],
};

export default function Home() {
  const [config, setConfig] = useState<BeadConfig>(DEFAULT_CONFIG);
  const [result, setResult] = useState<QuantizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRedeem, setShowRedeem] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>();
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
      const quantizeResult = await quantizeImage(imageRef.current, config);
      setResult(quantizeResult);
    } catch (err) {
      console.error('Quantize error:', err);
      alert('图片处理失败，请重试');
 } finally {
      setLoading(false);
    }
  }, [config]);

  const handleRedeemSuccess = useCallback((token: string) => {
    setShowRedeem(false);
    localStorage.setItem('bead_token', token);
    handleGenerate();
  }, [handleGenerate]);

  return (
    <main className="min-h-screen">
      <header className="text-center py-10 px-4 animate-fade-in-up">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-terracotta opacity-60" />
         <span className="w-2 h-2 rounded-full bg-sage opacity-40" />
      <span className="w-1.5 h-1.5 rounded-full bg-warm-300 opacity-50" />
      </div>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal tracking-tight">
         拼豆图纸生成器
    </h1>
  <div className="flex gap-1.5">
         <span className="w-1.5 h-1.5 rounded-full bg-warm-300 opacity-50" />
 <span className="w-2 h-2 rounded-full bg-sage opacity-40" />
            <span className="w-2 h-2 rounded-full bg-terracotta opacity-60" />
          </div>
        </div>
        <p className="text-warm-400 text-sm md:text-base">
 上传照片，一键生成 Artkal 拼豆图纸
     </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   <div className="space-y-6">
          <div className="animate-fade-in-up stagger-1">
     <div className="flex items-center gap-2 mb-3">
       <div className="section-number">01</div>
     <span className="text-sm font-semibold text-charcoal">上传图片</span>
              </div>
              <ImageUploader onImageLoad={handleImageLoad} />
     </div>

<div className="animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2 mb-3">
    <div className="section-number">02</div>
        <span className="text-sm font-semibold text-charcoal">参数配置</span>
       </div>
  <ConfigPanel
       config={config}
        onChange={setConfig}
      imageAspectRatio={imageAspectRatio}
       disabled={loading}
       />
   </div>

            <div className="animate-fade-in-up stagger-3">
         <div className="flex items-center gap-2 mb-3">
 <div className="section-number">03</div>
          <span className="text-sm font-semibold text-charcoal">生成图纸</span>
              </div>
   <button
  onClick={handleGenerate}
       disabled={loading || !imageRef.current}
          className="btn-primary w-full py-4 text-lg"
        >
     {loading ? (
            <span className="flex items-center justify-center gap-3">
  <span className="bead-loader">
         <span /><span /><span /><span /><span />
         </span>
   生成中...
 </span>
        ) : (
       '生成拼豆图纸'
       )}
      </button>
            </div>
   </div>

        <div className="space-y-6">
     <div className="animate-fade-in-up stagger-2">
            <div className="flex items-center gap-2 mb-3">
      <div className="section-number">04</div>
    <span className="text-sm font-semibold text-charcoal">预览效果</span>
              </div>
              <div className="min-h-[260px] flex flex-col">
    <BeadPreview result={result} loading={loading} />
              </div>
            </div>
            <div className="animate-fade-in-up stagger-3">
        <MaterialList result={result} />
    </div>
            <div className="animate-fade-in-up stagger-4">
   <DownloadButton result={result} />
            </div>
        </div>
     </div>
      </div>

      <RedeemDialog
        open={showRedeem}
     onClose={() => setShowRedeem(false)}
   onSuccess={handleRedeemSuccess}
      />

    <footer className="text-center py-6 text-xs text-warm-400 border-t border-warm-border">
        <p>拼豆图纸生成器 — 让每颗豆子都到位</p>
        <p className="mt-1">Artkal 色板仅供参考，实际颜色以实物为准</p>
      </footer>
    </main>
  );
}
