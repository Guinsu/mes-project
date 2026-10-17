import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

type Employee = {
    employee_no: string;
    employee_name: string;
    department: string;
    role: 'ADMIN' | 'PLANNER' | 'OPERATOR';
};

type AuthState = {
    user: User | null;
    employee: Employee | null;

    isAuthenticated: boolean;
    isLoading: boolean;

    setUser: (user: User | null) => void;
    setEmployee: (employee: Employee | null) => void;
    setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    employee: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => {
        set((state) => ({
            user,
            isAuthenticated: user !== null,
            employee: user && state.user?.id === user.id ? state.employee : null,
        }));
    },

    setEmployee: (employee) => {
        set({ employee });
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },
}));
