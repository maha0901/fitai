import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-card bg-bg/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-semibold text-white hover:text-accent transition-colors">
              Fit AI Server
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                to="/"
                className="text-text-secondary hover:text-white transition-colors text-sm font-medium"
              >
                Главная
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                      Админ
                    </Link>
                  )}
                  {user.role === 'client' && (
                    <Link
                      to="/client"
                      className="text-text-secondary hover:text-white transition-colors text-sm font-medium"
                    >
                      Обзор
                    </Link>
                  )}
                  <span className="text-text-secondary text-sm">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-card text-text-secondary hover:bg-accent hover:text-bg transition-all duration-200 text-sm font-medium"
                  >
                    Выход
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="px-4 py-2 rounded-lg bg-accent text-bg font-medium hover:bg-green-500 transition-all duration-200 text-sm"
                >
                  Войти
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-card py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
          Fit AI Server © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
