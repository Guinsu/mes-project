import { NavLink } from 'react-router';

export function Sidebar() {
    const menuStyle = 'mes-button-hover p-3.5';

    return (
        <nav className="w-40 shrink-0 p-4 text-center">
            <div className="flex flex-col gap-6 text-xl">
                <NavLink to="/production-plan" className={menuStyle}>
                    생산계획
                </NavLink>
                <NavLink to="/item" className={menuStyle}>
                    품목관리
                </NavLink>
                <NavLink to="/inventory" className={menuStyle}>
                    재고관리
                </NavLink>
                <NavLink to="/production-results" className={menuStyle}>
                    생산실적
                </NavLink>
            </div>
        </nav>
    );
}
