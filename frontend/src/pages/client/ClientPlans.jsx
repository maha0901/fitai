import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function ClientPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.user.getWorkoutPlans();
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError('');
    try {
      await api.ai.getPlan('Сгенерируй новый план тренировок');
      await load();
      toast('План сгенерирован');
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setRegenerating(false);
    }
  };

  const latest = plans[0];
  const forWeek = plans.slice(0, 7);

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
        <h1 className="text-2xl font-bold text-white">Планы тренировок</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-4 py-2 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            {regenerating ? 'Генерация...' : 'Перегенерировать план'}
          </button>
          <Link
            to="/client/chat"
            className="px-4 py-2 rounded-xl bg-card text-white font-medium text-sm hover:bg-card/80 border border-card transition-colors"
          >
            AI-чат
          </Link>
        </div>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <div className="space-y-6">
        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">На сегодня</h2>
          {latest ? (
            <div className="p-4 rounded-xl bg-bg border border-card">
              <p className="text-accent font-medium mb-2">{latest.title}</p>
              <pre className="text-text-secondary text-sm whitespace-pre-wrap font-sans">
                {latest.content}
              </pre>
              <p className="text-text-secondary text-xs mt-2">
                {new Date(latest.created_at).toLocaleString('ru')}
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-bg border border-card border-dashed text-center">
              <p className="text-text-secondary text-sm mb-4">Планов пока нет. Получите первый план — кнопкой ниже или в AI-чате.</p>
              <Link to="/client/chat" className="inline-flex px-4 py-2 rounded-xl bg-accent text-bg font-medium text-sm hover:bg-green-500 transition-colors">
                Открыть AI-чат
              </Link>
            </div>
          )}
        </section>

        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">На неделю (последние 7 планов)</h2>
          {forWeek.length > 0 ? (
            <ul className="space-y-3">
              {forWeek.map((plan) => (
                <li
                  key={plan.id}
                  className="p-4 rounded-xl bg-bg border border-card text-text-secondary text-sm"
                >
                  <span className="text-accent font-medium">{plan.title}</span>
                  <span className="mx-2">·</span>
                  <span>{new Date(plan.created_at).toLocaleDateString('ru')}</span>
                  <pre className="mt-2 whitespace-pre-wrap font-sans truncate max-h-20 overflow-hidden">
                    {plan.content}
                  </pre>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">Нет планов за неделю.</p>
          )}
        </section>

        <section className="bg-card rounded-2xl p-6 shadow-card border border-card">
          <h2 className="text-lg font-semibold text-white mb-4">История планов</h2>
          {plans.length > 0 ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {plans.map((plan) => (
                <li
                  key={plan.id}
                  className="flex items-center justify-between py-2 border-b border-card last:border-0"
                >
                  <span className="text-white text-sm">{plan.title}</span>
                  <span className="text-text-secondary text-xs">
                    {new Date(plan.created_at).toLocaleDateString('ru')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-secondary text-sm">История пуста.</p>
          )}
        </section>
      </div>
    </div>
  );
}
