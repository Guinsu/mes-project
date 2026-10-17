import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function AppLayout() {
    return (
        <div className="flex flex-col min-h-lvh">
            <Header />

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-blue-50 p-4 min-w-0 ">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
