import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';

export function AuthInitializer() {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const setEmployee = useAuthStore((state) => state.setEmployee);
    const setLoading = useAuthStore((state) => state.setLoading);

    // Supabase 로그인 상태 감지
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);

            if (event === 'INITIAL_SESSION') {
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading]);

    // 로그인한 직원의 정보 조회
    useEffect(() => {
        if (!user) {
            setEmployee(null);
            return;
        }

        let cancelled = false;

        const fetchEmployee = async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('employee_no, employee_name, department, role')
                .eq('user_id', user.id)
                .single();

            if (cancelled) return;

            if (error || !data) {
                console.error('직원 정보 조회 실패:', error);
                setEmployee(null);
                return;
            }

            setEmployee({
                employee_no: data.employee_no,
                employee_name: data.employee_name,
                department: data.department,
                role: data.role,
            });
        };

        fetchEmployee();

        return () => {
            cancelled = true;
        };
    }, [user?.id, setEmployee]);

    return null;
}
