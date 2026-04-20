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
