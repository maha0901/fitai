import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const nav = [
  { to: '/admin', end: true, label: 'Обзор' },
  { to: '/admin/users', end: false, label: 'Пользователи' },
  { to: '/admin/analytics', end: false, label: 'Аналитика и логи' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-card bg-card/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {nav.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-accent text-bg' : 'text-text-secondary hover:text-white hover:bg-bg'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
