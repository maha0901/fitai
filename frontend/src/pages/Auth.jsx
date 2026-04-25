import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await login(email, password);
      } else {
        data = await register(email, password, fullName || undefined);
      }
      const role = data?.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'client') navigate('/client');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-card border border-card p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            {isLogin ? 'Вход' : 'Регистрация'}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">
                  Имя
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Необязательно"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-bg border border-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-bg border border-card text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-text-secondary mt-1">Минимум 6 символов</p>
              )}
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-accent text-bg font-semibold hover:bg-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? 'Войти' : 'Регистрация'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="flex-1 py-3 rounded-xl bg-card text-text-secondary font-medium hover:bg-card/80 hover:text-white transition-all duration-200 border border-card"
              >
                {isLogin ? 'Регистрация' : 'Вход'}
              </button>
            </div>
          </form>
          <p className="text-center text-text-secondary text-sm mt-6">
            <Link to="/" className="text-accent hover:underline">
              На главную
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
