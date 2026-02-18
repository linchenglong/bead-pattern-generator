'use client';

import { useState } from 'react';

interface RedeemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export default function RedeemDialog({ open, onClose, onSuccess }: RedeemDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleRedeem = async () => {
    if (!code.trim()) {
    setError('请输入兑换码');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

   if (data.success && data.token) {
      localStorage.setItem('bead_token', data.token);
        onSuccess(data.token);
 setCode('');
      } else {
setError(data.error || '兑换失败');
    }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel p-8 max-w-sm w-full mx-4"
 onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="section-number">!</div>
          <h3 className="text-base font-bold text-charcoal">输入兑换码</h3>
     </div>
        <p className="text-xs text-warm-400 mb-5 ml-9">
 免费次数已用完，请输入兑换码继续使用
        </p>

        <input
          type="text"
          value={code}
 onChange={(e) => {
   setCode(e.target.value.toUpperCase());
            setError('');
  }}
    placeholder="请输入 8 位兑换码"
          maxLength={8}
       className="w-full px-4 py-3.5 border-2 border-warm-border rounded-xl text-center text-lg font-mono tracking-[0.3em] focus:border-terracotta focus:outline-none transition-colors bg-cream/50"
    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
        />

        {error && (
          <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
         onClick={onClose}
     className="btn-secondary flex-1 py-2.5 text-sm"
          >
   取消
          </button>
          <button
            onClick={handleRedeem}
     disabled={loading || !code.trim()}
   className="btn-primary flex-1 py-2.5 text-sm"
          >
            {loading ? '验证中...' : '确认兑换'}
     </button>
        </div>

        <p className="text-xs text-warm-300 text-center mt-5">
          购买兑换码请关注小红书「拼豆图纸」
        </p>
  </div>
    </div>
  );
}
