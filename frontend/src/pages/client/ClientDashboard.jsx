import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ClientDashboard() {
  const { toast } = useToast();
  const [fitness, setFitness] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [fit, history] = await Promise.all([
        api.user.getFitness(),
        api.user.getWeightHistory(),
      ]);
      setFitness(fit);
      setWeightHistory(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    setAdding(true);
    setError('');
    try {
      await api.user.addWeight(parseFloat(newWeight));
      setNewWeight('');
      await load();
      toast('Замер добавлен');
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const current = fitness?.current_weight ?? null;
  const target = fitness?.target_weight ?? null;
  const progressLabel =
    current != null && target != null
      ? current <= target
        ? `До цели: ${(target - current).toFixed(1)} кг`
        : `Набор: +${(current - target).toFixed(1)} кг`
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col gap-3">
          <div className="h-24 w-48 bg-card rounded-2xl animate-pulse" />
          <div className="h-24 w-48 bg-card rounded-2xl animate-pulse" />
          <div className="text-text-secondary text-sm">Загрузка...</div>
        </div>
      </div>
    );
  }

  const isEmpty = weightHistory.length === 0 && current == null && target == null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Обзор</h1>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      {isEmpty && (
        <div className="mb-8 p-8 bg-card rounded-2xl border border-card border-dashed text-center">
          <p className="text-text-secondary mb-4">Пока нет данных. Заполните профиль и добавьте первый замер — так мы построим график прогресса.</p>
          <Link
            to="/client/profile"
            className="inline-flex px-6 py-3 rounded-xl bg-accent text-bg font-medium hover:bg-green-500 transition-colors"
          >
            Заполнить профиль
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <p className="text-text-secondary text-sm mb-1">Текущий вес</p>
          <p className="text-2xl font-bold text-accent">
            {current != null ? `${current} кг` : '—'}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <p className="text-text-secondary text-sm mb-1">Цель</p>
          <p className="text-2xl font-bold text-white">
            {target != null ? `${target} кг` : '—'}
          </p>
          {fitness?.goal && (
            <p className="text-text-secondary text-sm mt-1">{fitness.goal}</p>
          )}
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <p className="text-text-secondary text-sm mb-1">Прогресс</p>
          <p className="text-lg font-semibold text-white">
            {progressLabel || 'Укажите вес и цель в Профиле'}
          </p>
          {weightHistory.length > 0 && (
            <p className="text-text-secondary text-sm mt-1">
              Замеров: {weightHistory.length}
            </p>
          )}
        </div>
        <div className="bg-card rounded-2xl p-6 shadow-card border border-card flex flex-col justify-center">
          <p className="text-text-secondary text-sm mb-2">Быстрые действия</p>
          <div className="flex flex-wrap gap-2">
            <form onSubmit={handleAddWeight} className="flex gap-2 flex-1 min-w-0">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Вес, кг"
                className="flex-1 min-w-0 w-20 px-3 py-2 rounded-xl bg-bg border border-card text-white text-sm focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={adding}
                className="px-3 py-2 rounded-xl bg-accent text-bg text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50"
              >
                Добавить замер
              </button>
            </form>
            <Link
              to="/client/chat"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-card text-white text-sm font-medium hover:bg-card/80 border border-card transition-colors"
            >
              Получить план
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card border border-card">
        <h2 className="text-lg font-semibold text-white mb-4">Навигация</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/client/measurements"
            className="block p-4 rounded-xl bg-bg border border-card text-white hover:border-accent/50 transition-colors"
          >
            <span className="font-medium">Замеры и прогресс</span>
            <p className="text-text-secondary text-sm mt-1">Таблица замеров и график</p>
          </Link>
          <Link
            to="/client/plans"
            className="block p-4 rounded-xl bg-bg border border-card text-white hover:border-accent/50 transition-colors"
          >
            <span className="font-medium">Планы тренировок</span>
            <p className="text-text-secondary text-sm mt-1">На сегодня, на неделю, история</p>
          </Link>
          <Link
            to="/client/chat"
            className="block p-4 rounded-xl bg-bg border border-card text-white hover:border-accent/50 transition-colors"
          >
            <span className="font-medium">AI-чат</span>
            <p className="text-text-secondary text-sm mt-1">Запросить план и советы</p>
          </Link>
          <Link
            to="/client/profile"
            className="block p-4 rounded-xl bg-bg border border-card text-white hover:border-accent/50 transition-colors"
          >
            <span className="font-medium">Профиль</span>
            <p className="text-text-secondary text-sm mt-1">Цель, активность, ограничения</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
