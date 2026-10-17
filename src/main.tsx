import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './router';
import './index.css';
import { AuthInitializer } from './components/AuthInitializer';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthInitializer />
        <RouterProvider router={router} />
    </StrictMode>,
);
