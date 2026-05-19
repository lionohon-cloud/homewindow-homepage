import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
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
      {
        path: 'review/new',
        lazy: () => import('./pages/ReviewNewPage'),
      },
      {
        path: 'review/type',
        lazy: () => import('./pages/ReviewTypePage'),
      },
      {
        path: 'review/write',
        lazy: () => import('./pages/ReviewWritePage'),
      },
      {
        path: 'review/done',
        lazy: () => import('./pages/ReviewDonePage'),
      },
      {
        path: 'review',
        lazy: () => import('./pages/ReviewListPage'),
      },
      {
        path: 'review/:id',
        lazy: () => import('./pages/ReviewDetailPage'),
      },
      {
        path: 'admin/reviews',
        lazy: () => import('./pages/AdminReviewListPage'),
      },
      {
        path: 'admin/reviews/:id',
        lazy: () => import('./pages/AdminReviewDetailPage'),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
