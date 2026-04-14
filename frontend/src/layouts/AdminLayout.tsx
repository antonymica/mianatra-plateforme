import { BookOpen, FilePlus2, LayoutDashboard, LogOut, PanelLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import toast from 'react-hot-toast';

import { AppLink } from '../components/AppLink';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';

export function AdminLayout({ children }: PropsWithChildren) {
  const { logout, user } = useAuth();
  const { navigate, path } = useNavigation();

  const handleLogout = () => {
    logout();
    toast.success('Session fermée.');
    navigate('/');
  };

  const itemClass = (target: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
      path === target ? 'bg-primary text-primary-content' : 'text-base-content/75 hover:bg-base-200'
    }`;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="drawer lg:drawer-open">
        <input className="drawer-toggle" id="admin-drawer" type="checkbox" />
        <div className="drawer-content min-h-screen">
          <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/95 backdrop-blur">
            <div className="navbar mx-auto min-h-16 max-w-7xl px-4">
              <div className="navbar-start">
                <label className="btn btn-ghost lg:hidden" htmlFor="admin-drawer">
                  <PanelLeft className="h-5 w-5" aria-hidden="true" />
                </label>
                <AppLink className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-black text-base-content hover:bg-base-200 sm:flex" to="/">
                  <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                  Mianatra PDF Academy
                </AppLink>
              </div>
              <div className="navbar-end gap-2">
                <span className="hidden text-sm font-medium text-base-content/60 sm:inline">
                  {user?.username}
                </span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout} type="button">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Déconnexion
                </button>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        </div>
        <div className="drawer-side z-40">
          <label aria-label="Fermer le menu admin" className="drawer-overlay" htmlFor="admin-drawer" />
          <aside className="min-h-full w-72 border-r border-base-300 bg-base-100 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-content">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-black">Mianatra PDF Academy</p>
                <p className="text-xs font-semibold uppercase text-base-content/45">Administration</p>
              </div>
            </div>
            <nav className="mt-8 space-y-2">
              <AppLink className={itemClass('/admin')} to="/admin">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                Tableau de bord
              </AppLink>
              <AppLink className={itemClass('/admin/courses/new')} to="/admin/courses/new">
                <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                Nouveau cours
              </AppLink>
              <AppLink className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-base-content/75 hover:bg-base-200" to="/">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Catalogue public
              </AppLink>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
