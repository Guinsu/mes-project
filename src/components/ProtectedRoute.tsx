import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../stores/useAuthStore';

export function ProtectedRoute() {
    const user = useAuthStore((state) => state.user);
    const isLoading = useAuthStore((state) => state.isLoading);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-slate-500">로그인 상태 확인 중...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
