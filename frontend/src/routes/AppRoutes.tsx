import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import toast from 'react-hot-toast';

import { AppLink } from '../components/AppLink';
import { AdminLayout } from '../layouts/AdminLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { CourseDetailsPage } from '../pages/CourseDetailsPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { CourseCreatePage } from '../pages/admin/CourseCreatePage';
import { CourseEditPage } from '../pages/admin/CourseEditPage';
import { DashboardPage } from '../pages/admin/DashboardPage';
import { useAuth } from '../hooks/useAuth';
import { NavigationContext, type NavigationContextValue, useNavigation } from '../hooks/useNavigation';
import { LoadingSpinner } from '../components/LoadingSpinner';

function getCurrentPath() {
  return window.location.pathname;
}

function matchId(path: string, pattern: RegExp): number | null {
  const match = path.match(pattern);
  if (!match?.[1]) {
    return null;
  }

  const id = Number(match[1]);
  return Number.isNaN(id) ? null : id;
}

function AdminGuard({ children }: PropsWithChildren) {
  const { loading, isAuthenticated } = useAuth();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Connexion administrateur requise.');
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !isAuthenticated) {
    return <LoadingSpinner label="Vérification de la session" />;
  }

  return children;
}

function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-semibold uppercase text-primary">404</p>
        <h1 className="mt-3 text-3xl font-bold text-base-content">Page introuvable</h1>
        <p className="mt-3 text-base-content/70">
          Cette adresse ne correspond à aucun espace disponible sur la plateforme.
        </p>
        <AppLink className="btn btn-primary mt-8" to="/">
          Revenir aux cours
        </AppLink>
      </section>
    </PublicLayout>
  );
}

function RouteRenderer() {
  const { path } = useNavigation();

  if (path === '/' || path === '/courses') {
    return (
      <PublicLayout>
        <HomePage />
      </PublicLayout>
    );
  }

  const courseId = matchId(path, /^\/courses\/(\d+)$/);
  if (courseId) {
    return (
      <PublicLayout>
        <CourseDetailsPage courseId={courseId} key={courseId} />
      </PublicLayout>
    );
  }

  if (path === '/login') {
    return (
      <PublicLayout>
        <LoginPage />
      </PublicLayout>
    );
  }

  if (path === '/admin') {
    return (
      <AdminGuard>
        <AdminLayout>
          <DashboardPage />
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (path === '/admin/courses/new') {
    return (
      <AdminGuard>
        <AdminLayout>
          <CourseCreatePage />
        </AdminLayout>
      </AdminGuard>
    );
  }

  const editId = matchId(path, /^\/admin\/courses\/(\d+)\/edit$/);
  if (editId) {
    return (
      <AdminGuard>
        <AdminLayout>
          <CourseEditPage courseId={editId} key={editId} />
        </AdminLayout>
      </AdminGuard>
    );
  }

  return <NotFoundPage />;
}

export function AppRoutes() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const onPopState = () => setPath(getCurrentPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((nextPath: string) => {
    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const value = useMemo<NavigationContextValue>(() => ({ path, navigate }), [navigate, path]);

  return (
    <NavigationContext.Provider value={value}>
      <RouteRenderer />
    </NavigationContext.Provider>
  );
}
