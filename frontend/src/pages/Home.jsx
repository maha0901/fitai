import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Fit AI Server
            </h1>
            <p className="text-lg sm:text-xl text-text-secondary mb-10">
              Умные тренировки и персональные планы на основе ИИ. Достигайте целей с помощью данных и технологий.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-accent text-bg font-semibold text-lg hover:bg-green-500 transition-all duration-200 shadow-lg hover:shadow-card-hover transform hover:-translate-y-0.5"
            >
              Начать
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Почему Fit AI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-card hover:border-accent/30 animate-slide-up">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">ИИ-планы</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Персональные планы тренировок и рекомендации, сгенерированные с учётом ваших целей и данных.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-card hover:border-accent/30 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Статистика</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Отслеживание веса и прогресса с наглядными графиками. Вся история в одном месте.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 border border-card hover:border-accent/30 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Фитнес-эстетика</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Современный интерфейс в тёмной теме. Минимализм и фокус на результате.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
