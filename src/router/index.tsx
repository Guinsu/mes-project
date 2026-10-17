import { createBrowserRouter } from 'react-router';
import { AppLayout } from '../layouts/AppLayout';
import { ProductionPlanPage } from '../pages/ProductionPlanPage';
import { ItemManagementPage } from '../pages/ItemManagementPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductionResultPage } from '../pages/ProductionResultPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const router = createBrowserRouter([
    {
        path: '/login',
        Component: LoginPage,
    },
    {
        Component: ProtectedRoute,
        children: [
            {
                path: '/',
                Component: AppLayout,
                children: [
                    {
                        index: true,
                        Component: HomePage,
                    },
                    {
                        path: 'production-plan',
                        Component: ProductionPlanPage,
                    },
                    {
                        path: 'item',
                        Component: ItemManagementPage,
                    },
                    {
                        path: 'inventory',
                        Component: InventoryPage,
                    },
                    {
                        path: 'production-results',
                        Component: ProductionResultPage,
                    },
                ],
            },
        ],
    },
]);
