import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

const ACTIVITY_LEVELS = [
  { value: 'low', label: 'Низкая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'high', label: 'Высокая' },
  { value: 'very_high', label: 'Очень высокая' },
];

export default function ClientProfile() {
  const { toast } = useToast();
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    current_weight: '',
    target_weight: '',
    goal: '',
    height_cm: '',
    age: '',
    activity_level: 'medium',
    limitations: '',
    privacy_show_stats: true,
  });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.user.getFitness();
      setFitness(data);
      if (data) {
        setForm({
          current_weight: data.current_weight ?? '',
          target_weight: data.target_weight ?? '',
          goal: data.goal ?? '',
          height_cm: data.height_cm ?? '',
          age: data.age ?? '',
          activity_level: data.activity_level ?? 'medium',
          limitations: data.limitations ?? '',
          privacy_show_stats: data.privacy_show_stats !== false,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        current_weight: form.current_weight ? parseFloat(form.current_weight) : undefined,
        target_weight: form.target_weight ? parseFloat(form.target_weight) : undefined,
        goal: form.goal || undefined,
        height_cm: form.height_cm ? parseInt(form.height_cm, 10) : undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        activity_level: form.activity_level,
        limitations: form.limitations || undefined,
        privacy_show_stats: form.privacy_show_stats,
      };
      const updated = await api.user.updateFitness(payload);
      setFitness(updated);
      toast('Настройки сохранены');
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-accent">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Профиль / Настройки</h1>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">Цель и параметры</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Текущий вес (кг)</label>
              <input
                type="number"
                step="0.1"
                value={form.current_weight}
                onChange={(e) => setForm((f) => ({ ...f, current_weight: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Целевой вес (кг)</label>
              <input
                type="number"
                step="0.1"
                value={form.target_weight}
                onChange={(e) => setForm((f) => ({ ...f, target_weight: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-text-secondary text-sm mb-1">Цель (текст)</label>
            <input
              type="text"
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              placeholder="Например: похудение, набор массы"
              className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Рост (см)</label>
              <input
                type="number"
                value={form.height_cm}
                onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Возраст</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">Уровень активности</h2>
          <select
            value={form.activity_level}
            onChange={(e) => setForm((f) => ({ ...f, activity_level: e.target.value }))}
            className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white focus:ring-2 focus:ring-accent"
          >
            {ACTIVITY_LEVELS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </section>

        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">Ограничения</h2>
          <p className="text-text-secondary text-sm mb-2">
            Травмы, доступное оборудование, противопоказания — учтём при генерации планов.
          </p>
          <textarea
            value={form.limitations}
            onChange={(e) => setForm((f) => ({ ...f, limitations: e.target.value }))}
            placeholder="Например: больное колено, нет тренажёрного зала, только дома"
            rows={3}
            className="w-full px-4 py-2 rounded-xl bg-bg border border-card text-white placeholder-text-secondary focus:ring-2 focus:ring-accent resize-none"
          />
        </section>

        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">Приватность</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.privacy_show_stats}
              onChange={(e) => setForm((f) => ({ ...f, privacy_show_stats: e.target.checked }))}
              className="w-4 h-4 rounded border-card bg-bg text-accent focus:ring-accent"
            />
            <span className="text-text-secondary text-sm">
              Показывать статистику и прогресс в моём профиле (для себя и возможных тренеров)
            </span>
          </label>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-accent text-bg font-semibold hover:bg-green-500 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}
