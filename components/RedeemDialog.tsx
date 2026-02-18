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
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in">
        <h3 className="text-lg font-bold text-gray-800 mb-2">🎫 输入兑换码</h3>
  <p className="text-sm text-gray-500 mb-5">
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
     className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-lg font-mono tracking-widest focus:border-pink-400 focus:outline-none transition-colors"
  onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
 />

        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}

        <div className="flex gap-3 mt-5">
   <button
     onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
>
    取消
</button>
    <button
         onClick={handleRedeem}
  disabled={loading || !code.trim()}
   className="flex-1 px-4 py-2.5 bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
     >
          {loading ? '验证中...' : '确认兑换'}
    </button>
        </div>

<p className="text-xs text-gray-400 text-center mt-4">
    购买兑换码请关注小红书「拼豆图纸」
        </p>
    </div>
    </div>
  );
}
