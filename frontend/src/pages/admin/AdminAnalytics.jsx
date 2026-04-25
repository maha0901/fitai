import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { api } from '../../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalytics() {
  const [activity, setActivity] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([api.admin.getActivity(14), api.admin.getLogs(100)])
      .then(([act, logList]) => {
        setActivity(act);
        setLogs(logList);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const activityChartData = {
    labels: activity.map((a) => new Date(a.day).toLocaleDateString('ru', { day: 'numeric', month: 'short' })),
    datasets: [
      { label: 'Замеры', data: activity.map((a) => a.weights), backgroundColor: 'rgba(34, 197, 94, 0.7)', borderColor: '#22C55E', borderWidth: 1 },
      { label: 'Планы', data: activity.map((a) => a.plans), backgroundColor: 'rgba(34, 197, 94, 0.5)', borderColor: '#22C55E', borderWidth: 1 },
      { label: 'Сообщения', data: activity.map((a) => a.messages), backgroundColor: 'rgba(34, 197, 94, 0.4)', borderColor: '#22C55E', borderWidth: 1 },
    ],
  };

  const totalActivityData = {
    labels: activity.map((a) => new Date(a.day).toLocaleDateString('ru', { day: 'numeric', month: 'short' })),
    datasets: [
      { label: 'Активность (всего)', data: activity.map((a) => a.total), borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.1)', fill: true, tension: 0.3 },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94A3B8' } },
      x: { grid: { display: false }, ticks: { color: '#94A3B8', maxRotation: 45 } },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-accent">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Аналитика и логи</h1>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Активность по дням (14 дней)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 shadow-card border border-card h-64">
            <Bar data={activityChartData} options={chartOptions} />
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card border border-card h-64">
            <Line data={totalActivityData} options={chartOptions} />
          </div>
        </div>
      </section>

      <section className="bg-card rounded-2xl shadow-card border border-card overflow-hidden">
        <h2 className="text-lg font-semibold text-white p-4 border-b border-card">Логи запросов и ошибок (последние 100)</h2>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-card">
                <th className="text-left text-text-secondary font-medium px-4 py-3">Время</th>
                <th className="text-left text-text-secondary font-medium px-4 py-3">Тип</th>
                <th className="text-left text-text-secondary font-medium px-4 py-3">Метод</th>
                <th className="text-left text-text-secondary font-medium px-4 py-3">Путь</th>
                <th className="text-left text-text-secondary font-medium px-4 py-3">Сообщение</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    Логов пока нет
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-card hover:bg-bg/30">
                    <td className="px-4 py-2 text-text-secondary whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString('ru')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={l.type === 'error' ? 'text-red-400' : 'text-text-secondary'}>
                        {l.type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white">{l.method}</td>
                    <td className="px-4 py-2 text-text-secondary truncate max-w-[200px]" title={l.path}>
                      {l.path}
                    </td>
                    <td className="px-4 py-2 text-text-secondary text-xs truncate max-w-[150px]" title={l.message}>
                      {l.message || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
