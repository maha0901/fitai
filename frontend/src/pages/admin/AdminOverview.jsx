import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin
      .getOverview()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-accent">Загрузка...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
    );
  }

  const kpis = [
    { label: 'Всего пользователей', value: data?.total_users ?? 0, accent: true },
    { label: 'Активных сегодня', value: data?.active_today ?? 0 },
    { label: 'Активных за 7 дней', value: data?.active_7d ?? 0 },
    { label: 'Планов сгенерировано', value: data?.plans_generated ?? 0 },
    { label: 'Сообщений в AI-чате', value: data?.messages_total ?? 0 },
    { label: 'Retention (7 д)', value: data?.retention_percent != null ? `${data.retention_percent}%` : '—' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Обзор (KPI)</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-card rounded-2xl p-6 shadow-card border border-card"
          >
            <p className="text-text-secondary text-sm mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.accent ? 'text-accent' : 'text-white'}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
