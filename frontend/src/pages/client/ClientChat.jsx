import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';

export default function ClientChat() {
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.ai.getChatHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.ai.chat(message);
      setMessage('');
      const data = await api.ai.getChatHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleGetPlan = async () => {
    setSending(true);
    setError('');
    try {
      await api.ai.getPlan(message || 'Дай мне план тренировки на сегодня');
      setMessage('');
      const data = await api.ai.getChatHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
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
    <div className="animate-fade-in flex flex-col h-[calc(100vh-12rem)] min-h-[400px]">
      <h1 className="text-2xl font-bold text-white mb-4">AI-чат</h1>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <div className="flex-1 flex flex-col bg-card rounded-2xl border border-card shadow-card overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 && !sending && (
            <p className="text-text-secondary text-sm">
              Напишите сообщение или нажмите «Получить план», чтобы получить рекомендации.
            </p>
          )}
          {history.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-accent/20 text-white'
                    : 'bg-bg text-text-secondary border border-card'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-2 bg-bg border border-card text-text-secondary text-sm">
                ИИ думает...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-card flex flex-wrap gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
            placeholder="Сообщение или запрос плана..."
            className="flex-1 min-w-[200px] px-4 py-3 rounded-xl bg-bg border border-card text-white placeholder-text-secondary focus:ring-2 focus:ring-accent"
          />
          <button
            onClick={handleGetPlan}
            disabled={sending}
            className="px-4 py-3 rounded-xl bg-accent text-bg font-medium hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            Получить план
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="px-4 py-3 rounded-xl bg-card text-white font-medium hover:bg-card/80 transition-colors disabled:opacity-50"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}
