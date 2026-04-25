import React from 'react';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Подтвердить', cancelLabel = 'Отмена', onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <div
        className="bg-card rounded-2xl shadow-card border border-card p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-bg border border-card text-white text-sm font-medium hover:bg-card transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              danger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-accent text-bg hover:bg-green-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
