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
  width: 29,
  height: 29,
  maxColors: 16,
  dithering: false,
  colorMode: 'color',
  useFullPalette: false,
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

    // 根据图片比例自动调整尺寸
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
    // 清除之前的结果
 setResult(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!imageRef.current) {
  alert('请先上传图片');
      return;
    }

    // 检查使用权限
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
      // API 出错时放行（容错）
    console.warn('Usage check failed, allowing...');
  }

    // 执行量化
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
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
 🫘 拼豆图纸生成器
        </h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">
上传照片，一键生成 Artkal 拼豆图纸
   </p>
      </header>

 <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
     {/* 左栏：上传 + 配置 */}
          <div className="space-y-6">
            <ImageUploader onImageLoad={handleImageLoad} />
        <ConfigPanel
          config={config}
              onChange={setConfig}
         imageAspectRatio={imageAspectRatio}
  disabled={loading}
  />

     {/* 生成按钮 */}
        <button
              onClick={handleGenerate}
    disabled={loading || !imageRef.current}
  className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg font-bold rounded-2xl hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
  {loading ? '⏳ 生成中...' : '✨ 生成拼豆图纸'}
         </button>
       </div>

      {/* 右栏：预览 + 用料 + 下载 */}
     <div className="space-y-6">
            <BeadPreview result={result} loading={loading} />
            <MaterialList result={result} />
 <DownloadButton result={result} />
 </div>
        </div>
      </div>

  {/* 兑换码弹窗 */}
   <RedeemDialog
        open={showRedeem}
        onClose={() => setShowRedeem(false)}
        onSuccess={handleRedeemSuccess}
    />

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        <p>拼豆图纸生成器 — 让每颗豆子都到位 ❤️</p>
        <p className="mt-1">Artkal 色板仅供参考，实际颜色以实物为准</p>
      </footer>
    </main>
  );
}
