import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../../api/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PERIODS = [
  { value: '7', label: '7 дней' },
  { value: '30', label: '30 дней' },
  { value: '90', label: '90 дней' },
  { value: 'all', label: 'Всё время' },
];

export default function ClientMeasurements() {
  const [list, setList] = useState([]);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.user.getWeightHistory();
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (period === 'all') return list;
    const days = parseInt(period, 10);
    const cut = new Date();
    cut.setDate(cut.getDate() - days);
    return list.filter((r) => new Date(r.recorded_at) >= cut);
  }, [list, period]);

  const chartData = useMemo(
    () => ({
      labels: filtered.map((r) =>
        new Date(r.recorded_at).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
      ),
      datasets: [
        {
          label: 'Вес (кг)',
          data: filtered.map((r) => r.weight),
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.3,
        },
      ],
    }),
    [filtered]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 11 } },
      },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Замеры / Прогресс</h1>
        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-sm">Период:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-card border border-card rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-accent"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-2xl p-6 shadow-card border border-card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">График</h2>
        <div className="h-64 sm:h-80">
          {filtered.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary text-sm text-center px-4">
              <p className="mb-2">Нет замеров за выбранный период.</p>
              <Link to="/client" className="text-accent hover:underline font-medium">Добавить замер на Обзоре</Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card border border-card overflow-hidden">
        <h2 className="text-lg font-semibold text-white p-6 pb-0">Таблица замеров</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card">
                <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">Дата</th>
                <th className="text-left text-text-secondary text-sm font-medium px-6 py-4">Вес (кг)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-text-secondary text-sm">
                    Нет данных
                  </td>
                </tr>
              ) : (
                [...filtered].reverse().map((r, i) => (
                  <tr key={i} className="border-b border-card hover:bg-bg/30">
                    <td className="px-6 py-3 text-white text-sm">
                      {new Date(r.recorded_at).toLocaleString('ru', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-accent font-medium">{r.weight}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
