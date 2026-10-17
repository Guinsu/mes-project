import { NavLink } from 'react-router';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/useAuthStore';
import './Header.css';

export function Header() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const employee = useAuthStore((state) => state.employee);
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert('로그아웃 중 오류가 발생했습니다.');
            return;
        }

        navigate('/login', { replace: true });
    };

    return (
        <>
            <header className="app-header">
                <div className="app-content">
                    <div className="flex flex-row  items-center gap-4">
                        <NavLink to="/">MES</NavLink>
                        <span className="text-slate-600 text-2xl">
                            {employee ? `${employee.employee_name} · ${employee.department}` : '직원 정보 확인 중...'}
                        </span>
                    </div>

                    <div className="flex flex-row  gap-4">
                        <NavLink to="/">홈</NavLink>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
