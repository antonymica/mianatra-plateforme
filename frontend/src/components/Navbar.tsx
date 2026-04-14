import { BookOpen, ChevronDown, LibraryBig, LogIn, LogOut, Menu, PanelLeft, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import { AppLink } from './AppLink';

const themes = [
  { label: 'Clair pro', value: 'academy' },
  { label: 'Clair', value: 'light' },
  { label: 'Vert', value: 'emerald' },
  { label: 'Corporate', value: 'corporate' },
  { label: 'Sombre', value: 'dark' },
];

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { navigate, path } = useNavigation();
  const [theme, setTheme] = useState(() => localStorage.getItem('pdf_academy_theme') || 'academy');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdf_academy_theme', theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    toast.success('Session fermée.');
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-40 border-b border-base-300 bg-base-100/90 backdrop-blur">
      <div className="navbar mx-auto min-h-16 max-w-7xl px-4">
        <div className="navbar-start">
          <div className="dropdown mr-1 lg:hidden">
            <button className="btn btn-ghost lg:hidden" tabIndex={0} type="button">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <ul
              className="menu dropdown-content z-50 mt-3 w-64 rounded-lg border border-base-300 bg-base-100 p-2 shadow-xl"
              tabIndex={0}
            >
              <li>
                <AppLink to="/">
                  <LibraryBig className="h-4 w-4" />
                  Catalogue
                </AppLink>
              </li>
              {isAuthenticated && (
                <li>
                  <AppLink to="/admin">
                    <PanelLeft className="h-4 w-4" />
                    Administration
                  </AppLink>
                </li>
              )}
            </ul>
          </div>
          <AppLink className="flex items-center gap-3 text-base font-black text-base-content sm:text-lg" to="/">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-content">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="leading-tight">Mianatra PDF Academy</span>
          </AppLink>
        </div>

        <div className="navbar-end gap-2 sm:gap-3">
          <AppLink
            className={`hidden rounded-lg px-4 py-2 text-sm font-bold transition lg:inline-flex ${
              path === '/' || path.startsWith('/courses')
                ? 'bg-base-200 text-base-content'
                : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
            }`}
            to="/"
          >
            Catalogue
          </AppLink>
          <label className="hidden h-10 items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 text-xs font-semibold shadow-sm sm:flex">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <select
              aria-label="Changer de thème"
              className="bg-transparent text-base-content outline-none"
              onChange={(event) => setTheme(event.target.value)}
              value={theme}
            >
              {themes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <button className="btn btn-outline btn-sm gap-2" tabIndex={0} type="button">
                <span className="hidden sm:inline">{user?.username}</span>
                <PanelLeft className="h-4 w-4 sm:hidden" aria-hidden="true" />
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <ul
                className="menu dropdown-content z-50 mt-3 w-60 rounded-lg border border-base-300 bg-base-100 p-2 shadow-xl"
                tabIndex={0}
              >
                <li>
                  <AppLink to="/admin">
                    <PanelLeft className="h-4 w-4" />
                    Administration
                  </AppLink>
                </li>
                <li>
                  <button onClick={handleLogout} type="button">
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <AppLink className="btn btn-primary btn-sm px-4" to="/login">
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Connexion
            </AppLink>
          )}
        </div>
      </div>
    </div>
  );
}
