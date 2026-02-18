'use client';

import { useState, useEffect, useCallback } from 'react';

interface CodeInfo {
  code: string;
  status: 'unused' | 'used';
  usedAt: number | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 生成兑换码
  const [generateCount, setGenerateCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const [generateMsg, setGenerateMsg] = useState('');

  // 兑换码列表
  const [codes, setCodes] = useState<CodeInfo[]>([]);
  const [loading, setLoading] = useState(false);
const [copied, setCopied] = useState('');

  // 页面加载时从 sessionStorage 恢复密码
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_password');
    if (saved) {
      setPassword(saved);
      setLoggedIn(true);
    }
  }, []);

  // 登录后自动加载列表
  useEffect(() => {
    if (loggedIn) {
      fetchCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn]);

  const getHeaders = useCallback(() => {
 return { 'Content-Type': 'application/json', 'x-admin-password': password };
  }, [password]);

  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch('/api/admin/codes', {
        headers: getHeaders(),
      });
      if (res.ok) {
        sessionStorage.setItem('admin_password', password);
        setLoggedIn(true);
      } else {
        setLoginError('密码错误');
      }
    } catch {
      setLoginError('网络错误');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    setLoggedIn(false);
    setPassword('');
    setCodes([]);
    setNewCodes([]);
  };

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/codes', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
      setCodes(data.codes);
    }
    } catch (e) {
      console.error('Fetch codes error:', e);
    } finally {
   setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateMsg('');
    setNewCodes([]);
    try {
  const res = await fetch('/api/admin/generate', {
        method: 'POST',
  headers: getHeaders(),
        body: JSON.stringify({ count: generateCount }),
      });
      const data = await res.json();
    if (res.ok) {
  setNewCodes(data.codes);
        setGenerateMsg(data.message);
   fetchCodes(); // 刷新列表
      } else {
        setGenerateMsg(data.error || '生成失败');
      }
    } catch {
      setGenerateMsg('网络错误');
    } finally {
      setGenerating(false);
  }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 1500);
  };

  const copyAllNewCodes = async () => {
    const text = newCodes.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied('__all__');
    setTimeout(() => setCopied(''), 1500);
  };

  const formatTime = (ts: number | null) => {
    if (!ts) return '-';
    const d = new Date(ts);
    return d.toLocaleString('zh-CN', {
  year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const usedCount = codes.filter((c) => c.status === 'used').length;
  const unusedCount = codes.filter((c) => c.status === 'unused').length;

  // 未登录 → 登录表单
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-center mb-6 text-gray-800">
            🔐 管理员后台
        </h1>
          <div className="space-y-4">
     <input
    type="password"
              placeholder="请输入管理密码"
    value={password}
       onChange={(e) => setPassword(e.target.value)}
       onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            {loginError && (
  <p className="text-red-500 text-sm">{loginError}</p>
            )}
         <button
              onClick={handleLogin}
           className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium cursor-pointer"
         >
      登录
  </button>
       </div>
        </div>
   </div>
    );
  }

  // 已登录 → 管理面板
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">🔐 管理员后台</h1>
       <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition cursor-pointer"
          >
         退出登录
      </button>
        </div>

        {/* 生成兑换码 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📦 生成兑换码
          </h2>
 <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">数量:</label>
 <input
    type="number"
              min={1}
  max={100}
            value={generateCount}
    onChange={(e) => setGenerateCount(Number(e.target.value))}
        className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
     />
         <button
              onClick={handleGenerate}
              disabled={generating}
    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium cursor-pointer"
   >
              {generating ? '生成中...' : '生成'}
            </button>
        </div>

    {generateMsg && (
  <p className="mt-3 text-sm text-green-600">{generateMsg}</p>
        )}

          {newCodes.length > 0 && (
  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
     <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-green-800">
        新生成的兑换码
  </span>
  <button
          onClick={copyAllNewCodes}
       className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition cursor-pointer"
          >
              {copied === '__all__' ? '已复制!' : '全部复制'}
     </button>
            </div>
        <div className="flex flex-wrap gap-2">
      {newCodes.map((code) => (
     <button
                key={code}
   onClick={() => copyToClipboard(code)}
       className="font-mono text-sm bg-white px-3 py-1.5 rounded border border-green-300 hover:bg-green-100 transition cursor-pointer"
       title="点击复制"
           >
  {code}
  {copied === code && (
  <span className="ml-1 text-green-600">✓</span>
          )}
       </button>
       ))}
   </div>
    </div>
 )}
        </div>

  {/* 兑换码列表 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
   <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
            📋 兑换码列表
          </h2>
      <span className="text-sm text-gray-500">
        共 {codes.length} 个（已用 {usedCount} / 未用 {unusedCount}）
      </span>
            </div>
    <button
              onClick={fetchCodes}
              disabled={loading}
          className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
            >
   {loading ? '加载中...' : '🔄 刷新'}
 </button>
    </div>

          {codes.length === 0 ? (
  <p className="text-gray-400 text-center py-8">暂无兑换码</p>
    ) : (
            <div className="overflow-x-auto">
         <table className="w-full text-sm">
       <thead>
       <tr className="border-b border-gray-200">
       <th className="text-left py-3 px-2 text-gray-600 font-medium">
   兑换码
     </th>
              <th className="text-center py-3 px-2 text-gray-600 font-medium">
    状态
        </th>
       <th className="text-left py-3 px-2 text-gray-600 font-medium">
             使用时间
      </th>
          </tr>
    </thead>
       <tbody>
         {codes.map((item) => (
    <tr
 key={item.code}
   className="border-b border-gray-100 hover:bg-gray-50"
          >
    <td className="py-2.5 px-2">
  <button
           onClick={() => copyToClipboard(item.code)}
          className="font-mono text-gray-800 hover:text-blue-600 transition cursor-pointer"
                  title="点击复制"
     >
 {item.code}
    {copied === item.code && (
          <span className="ml-1 text-green-500 text-xs">
  已复制
       </span>
      )}
         </button>
   </td>
    <td className="py-2.5 px-2 text-center">
  {item.status === 'used' ? (
         <span className="text-orange-600">✅ 已用</span>
     ) : (
            <span className="text-green-600">⬜ 未用</span>
           )}
    </td>
      <td className="py-2.5 px-2 text-gray-500">
    {formatTime(item.usedAt)}
      </td>
     </tr>
        ))}
 </tbody>
        </table>
</div>
        )}
   </div>
   </div>
    </div>
  );
}
