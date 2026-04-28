import { createBrowserRouter, RouterProvider } from 'react-router';
import AppLayout from './AppLayout';
import HomePage from './pages/HomePage';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'thanks',
        lazy: () => import('./pages/ThanksPage'),
      },
      {
        path: 'as',
        lazy: () => import('./pages/AsReceptionPage'),
      },
      {
        path: 'as/done',
        lazy: () => import('./pages/AsDonePage'),
      },
      {
        path: 'as/lookup',
        lazy: () => import('./pages/AsLookupPage'),
      },
      {
        path: 'admin/as/login',
        lazy: () => import('./pages/AdminAsLoginPage'),
      },
      {
        path: 'admin/as',
        lazy: () => import('./pages/AdminAsListPage'),
      },
      {
        path: 'admin/as/:id',
        lazy: () => import('./pages/AdminAsDetailPage'),
      },
      {
        path: 'admin/utm',
        lazy: () => import('./pages/AdminUtmPage'),
      },
      {
        path: 'admin/dashboard',
        lazy: () => import('./pages/AdminDashboardPage'),
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
