import React, { useEffect, useState } from 'react';
import { ArrowLeft, LoaderCircle, LockKeyhole, LogOut, RotateCcw } from 'lucide-react';
import {
  ADMIN_EMAIL,
  getPasswordSetupUser,
  isUsageStatsConfigured,
  loadFurnitureUsage,
  resetFurnitureUsage,
  setPasswordFromAuthLink,
  signInAdmin,
  signOutAdmin,
} from './lib/usageStats';

function readAuthCallback() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const type = params.get('type');
  const accessToken = params.get('access_token');
  if (!accessToken || !['invite', 'recovery'].includes(type)) return null;
  return { type, accessToken };
}

export default function AdminPage() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authCallback, setAuthCallback] = useState(readAuthCallback);
  const [isVerifyingLink, setIsVerifyingLink] = useState(Boolean(authCallback));
  const [session, setSession] = useState(null);
  const [counts, setCounts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const refreshCounts = async () => {
    setError('');
    try {
      const result = await loadFurnitureUsage();
      setSession(result.session);
      setCounts(result.counts);
    } catch (err) {
      setError(err.message || '통계를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    if (!isUsageStatsConfigured) return;
    if (!authCallback) {
      refreshCounts();
      return;
    }

    const cleanUrl = new URL(window.location.href);
    cleanUrl.hash = '';
    window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}`);

    let cancelled = false;
    getPasswordSetupUser(authCallback.accessToken)
      .then(user => {
        if (!cancelled) setEmail(user.email);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || '초대 링크를 확인하지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setIsVerifyingLink(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const nextSession = await signInAdmin(email.trim(), password);
      if (nextSession.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
        signOutAdmin();
        throw new Error('등록된 관리자 계정으로 로그인해 주세요.');
      }
      setPassword('');
      await refreshCounts();
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleSetPassword = async (event) => {
    event.preventDefault();
    if (password.length < 8) {
      setError('비밀번호를 8자 이상 입력해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 서로 다릅니다.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');
    try {
      await setPasswordFromAuthLink(authCallback.accessToken, password);
      setPassword('');
      setConfirmPassword('');
      setAuthCallback(null);
      setNotice('비밀번호 설정이 완료되었습니다. 관리자 페이지에서 로그인해 주세요.');
    } catch (err) {
      setError(err.message || '비밀번호를 설정하지 못했습니다. 초대 링크가 만료되었는지 확인해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('모든 가구 사용 횟수를 0으로 초기화할까요?')) return;

    setBusy(true);
    setError('');
    setNotice('');
    try {
      await resetFurnitureUsage();
      await refreshCounts();
      setNotice('가구 사용 횟수를 초기화했습니다.');
    } catch (err) {
      setError(err.message || '초기화하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    signOutAdmin();
    setSession(null);
    setCounts([]);
    setNotice('');
    setError('');
  };

  if (!isUsageStatsConfigured) {
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-12 text-gray-900">
        <section className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg">
          <a href="./" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={18} /> 프로토타입으로 돌아가기
          </a>
          <h1 className="text-2xl font-bold">관리자 가구 통계</h1>
          <p className="mt-3 leading-relaxed text-gray-600">
            통계 저장소가 아직 연결되지 않았습니다. Supabase 프로젝트를 만든 뒤 README의 설정 순서에 따라 연결해 주세요.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div className="mb-7 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#35C5F0]">오늘의집 공모전</p>
            <h1 className="mt-1 text-2xl font-bold">관리자 가구 통계</h1>
          </div>
          {session && (
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <LogOut size={16} /> 로그아웃
            </button>
          )}
        </div>

        {error && <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</div>}

        {authCallback ? (
          isVerifyingLink ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
              <LoaderCircle className="animate-spin" size={18} /> 초대 링크 확인 중...
            </div>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <p className="text-sm leading-relaxed text-gray-500">
                {authCallback.type === 'invite' ? '관리자 계정 초대를 수락합니다.' : '관리자 계정 비밀번호를 재설정합니다.'}
                {email && <> 로그인 이메일: <b className="text-gray-700">{email}</b></>}
              </p>
              <label className="block text-sm font-medium">
                새 비밀번호
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#35C5F0]"
                />
              </label>
              <label className="block text-sm font-medium">
                새 비밀번호 확인
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#35C5F0]"
                />
              </label>
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#35C5F0] px-4 py-3 font-bold text-white hover:bg-[#28AADC] disabled:opacity-60">
                {busy ? <LoaderCircle className="animate-spin" size={18} /> : <LockKeyhole size={18} />}
                비밀번호 설정
              </button>
            </form>
          )
        ) : !session ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-500">관리자 계정으로 로그인하면 공모전 응모에 사용된 가구 수를 확인할 수 있습니다.</p>
            <label className="block text-sm font-medium">
              관리자 이메일
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#35C5F0]"
              />
            </label>
            <label className="block text-sm font-medium">
              비밀번호
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-[#35C5F0]"
              />
            </label>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#35C5F0] px-4 py-3 font-bold text-white hover:bg-[#28AADC] disabled:opacity-60">
              {busy ? <LoaderCircle className="animate-spin" size={18} /> : <LockKeyhole size={18} />}
              관리자 로그인
            </button>
          </form>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">로그인 계정: <span className="font-medium text-gray-700">{session.user.email}</span></p>
              <div className="flex gap-2">
                <button onClick={refreshCounts} disabled={busy} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60">
                  <RotateCcw size={15} /> 새로고침
                </button>
                <button onClick={handleReset} disabled={busy} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                  전체 초기화
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="grid grid-cols-[1fr_auto] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <span>가구</span><span>응모에 사용된 수</span>
              </div>
              {counts.map((item) => (
                <div key={item.item_id} className="grid grid-cols-[1fr_auto] border-t border-gray-100 px-4 py-3 text-sm">
                  <span>{item.item_name}</span><span className="font-bold tabular-nums">{Number(item.total).toLocaleString()}개</span>
                </div>
              ))}
              <div className="grid grid-cols-[1fr_auto] border-t border-gray-200 bg-blue-50 px-4 py-3 font-bold">
                <span>전체</span>
                <span className="tabular-nums">{counts.reduce((sum, item) => sum + Number(item.total), 0).toLocaleString()}개</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-gray-400">방 이미지를 저장한 시점의 배치 가구가 집계됩니다. 고정 설비와 배치하지 않은 가구는 집계되지 않습니다.</p>
          </>
        )}
      </section>
    </main>
  );
}
