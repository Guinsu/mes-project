import { useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';

export function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
                return;
            }

            navigate('/', { replace: true });
        } catch {
            setError('로그인 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
                <div className="mb-10 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">MES System</h1>

                    <p className="mt-2 text-sm text-slate-500">생산관리 시스템에 로그인하세요</p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                            이메일
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            autoComplete="username"
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                            비밀번호
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            autoComplete="current-password"
                            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400">계정 문의는 시스템 관리자에게 연락하세요.</p>
            </div>
        </div>
    );
}
