import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  const load = (q) => {
    setLoading(true);
    setError('');
    api.admin
      .getUsers(q || search)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleSelectUser = (id) => {
    if (selected === id) {
      setSelected(null);
      return;
    }
    setSelected(id);
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    setError('');
    try {
      await api.admin.updateUserRole(userId, newRole);
      toast('Роль обновлена');
      load();
      if (selected === userId) {
        api.admin.getUser(userId).then(setUserDetail).catch(() => setUserDetail(null));
      }
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    const userId = deleteConfirm.id;
    setDeleteConfirm(null);
    setActionLoading(userId);
    setError('');
    try {
      await api.admin.deleteUser(userId);
      toast('Пользователь удалён');
      setSelected(null);
      load();
    } catch (e) {
      setError(e.message);
      toast(e.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const [userDetail, setUserDetail] = useState(null);
  useEffect(() => {
    if (!selected) {
      setUserDetail(null);
      return;
    }
    api.admin.getUser(selected).then(setUserDetail).catch(() => setUserDetail(null));
  }, [selected]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Пользователи</h1>
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSearch} className="mb-6 flex gap-2 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по email или имени..."
          className="flex-1 min-w-[200px] px-4 py-2 rounded-xl bg-card border border-card text-white placeholder-text-secondary focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-accent text-bg font-medium hover:bg-green-500 transition-colors"
        >
          Найти
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl shadow-card border border-card overflow-hidden">
          <h2 className="text-lg font-semibold text-white p-4 border-b border-card">Список</h2>
          {loading ? (
            <div className="p-8 text-center text-text-secondary text-sm">Загрузка...</div>
          ) : (
            <ul className="divide-y divide-card max-h-[400px] overflow-y-auto">
              {users.length === 0 ? (
                <li className="p-6 text-center text-text-secondary text-sm">Никого не найдено</li>
              ) : (
                users.map((u) => (
                  <li
                    key={u.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selected === u.id ? 'bg-accent/20' : 'hover:bg-bg/30'
                    }`}
                    onClick={() => handleSelectUser(u.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">{u.email}</p>
                        <p className="text-text-secondary text-sm">{u.full_name || '—'}</p>
                      </div>
                      <span className="text-xs text-text-secondary">{u.role}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-card overflow-hidden">
          <h2 className="text-lg font-semibold text-white p-4 border-b border-card">Карточка пользователя</h2>
          {!userDetail ? (
            <div className="p-8 text-center text-text-secondary text-sm">
              Выберите пользователя из списка
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-text-secondary text-sm">Email</p>
                <p className="text-white font-medium">{userDetail.email}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Имя, роль</p>
                <p className="text-white">{userDetail.full_name || '—'} · {userDetail.role}</p>
              </div>
              <div>
                <p className="text-text-secondary text-sm">Замеры / Планы / Активность</p>
                <p className="text-white">
                  Замеров: {userDetail.weight_records_count ?? 0}, планов: {userDetail.plans_count ?? 0}
                </p>
                {userDetail.last_activity && (
                  <p className="text-text-secondary text-xs mt-1">
                    Последняя активность: {new Date(userDetail.last_activity).toLocaleString('ru')}
                  </p>
                )}
              </div>
              {userDetail.fitness && (
                <div>
                  <p className="text-text-secondary text-sm">Цель, вес</p>
                  <p className="text-white text-sm">
                    {userDetail.fitness.goal || '—'} · {userDetail.fitness.current_weight ?? '—'} кг → {userDetail.fitness.target_weight ?? '—'} кг
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <select
                  value={userDetail.role}
                  onChange={(e) => handleRoleChange(userDetail.id, e.target.value)}
                  disabled={actionLoading === userDetail.id}
                  className="bg-bg border border-card rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-accent"
                >
                  <option value="client">client</option>
                  <option value="admin">admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(userDetail)}
                  disabled={actionLoading === userDetail.id}
                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30"
                >
                  Удалить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Удалить пользователя?"
        message={deleteConfirm ? `Будут удалены все данные ${deleteConfirm.email}. Нельзя отменить.` : ''}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
