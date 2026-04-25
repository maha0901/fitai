const { pool } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const clientsCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'client'");
    const adminsCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    const plansCount = await pool.query('SELECT COUNT(*) FROM workout_plans');
    const weightRecordsCount = await pool.query('SELECT COUNT(*) FROM weight_history');

    res.json({
      total_users: parseInt(usersCount.rows[0].count, 10),
      clients: parseInt(clientsCount.rows[0].count, 10),
      admins: parseInt(adminsCount.rows[0].count, 10),
      total_workout_plans: parseInt(plansCount.rows[0].count, 10),
      total_weight_records: parseInt(weightRecordsCount.rows[0].count, 10),
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeToday = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM weight_history WHERE recorded_at >= $1
        UNION SELECT user_id FROM workout_plans WHERE created_at >= $1
        UNION SELECT user_id FROM ai_messages WHERE created_at >= $1
      ) t`,
      [todayStart]
    );
    const active7d = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM (
        SELECT user_id FROM weight_history WHERE recorded_at >= $1
        UNION SELECT user_id FROM workout_plans WHERE created_at >= $1
        UNION SELECT user_id FROM ai_messages WHERE created_at >= $1
      ) t`,
      [sevenDaysAgo]
    );
    const plansGenerated = await pool.query('SELECT COUNT(*) FROM workout_plans');
    const messagesTotal = await pool.query('SELECT COUNT(*) FROM ai_messages');

    const total = parseInt(totalUsers.rows[0].count, 10);
    const active7 = parseInt(active7d.rows[0].count, 10);
    const retention = total > 0 ? Math.round((active7 / total) * 100) : 0;

    res.json({
      total_users: total,
      active_today: parseInt(activeToday.rows[0].count, 10),
      active_7d: active7,
      plans_generated: parseInt(plansGenerated.rows[0].count, 10),
      messages_total: parseInt(messagesTotal.rows[0].count, 10),
      retention_percent: retention,
    });
  } catch (err) {
    console.error('Get overview error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const search = (req.query.search || '').trim().replace(/%/g, '\\%');
    const hasSearch = search.length > 0;
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.created_at,
              uf.current_weight, uf.target_weight, uf.goal, uf.city, uf.country
       FROM users u
       LEFT JOIN user_fitness uf ON u.id = uf.user_id
       WHERE ($1::boolean = false OR u.email ILIKE $2 OR u.full_name ILIKE $2)
       ORDER BY u.created_at DESC`,
      [hasSearch, hasSearch ? `%${search}%` : '%']
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      full_name: r.full_name,
      created_at: r.created_at,
      current_weight: r.current_weight != null ? parseFloat(r.current_weight) : null,
      target_weight: r.target_weight != null ? parseFloat(r.target_weight) : null,
      goal: r.goal,
      city: r.city,
      country: r.country || 'Казахстан',
    })));
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.created_at,
              uf.current_weight, uf.target_weight, uf.goal, uf.height_cm, uf.age, uf.activity_level, uf.city, uf.country
       FROM users u
       LEFT JOIN user_fitness uf ON u.id = uf.user_id
       WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const r = result.rows[0];
    const weightCount = await pool.query('SELECT COUNT(*) FROM weight_history WHERE user_id = $1', [id]);
    const plansCount = await pool.query('SELECT COUNT(*) FROM workout_plans WHERE user_id = $1', [id]);
    const lastWeight = await pool.query('SELECT recorded_at FROM weight_history WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 1', [id]);
    const lastPlan = await pool.query('SELECT created_at FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);
    const lastMessage = await pool.query('SELECT created_at FROM ai_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);
    const dates = [lastWeight.rows[0]?.recorded_at, lastPlan.rows[0]?.created_at, lastMessage.rows[0]?.created_at].filter(Boolean).map((d) => new Date(d));
    const last_activity = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

    res.json({
      id: r.id,
      email: r.email,
      role: r.role,
      full_name: r.full_name,
      created_at: r.created_at,
      fitness: {
        current_weight: r.current_weight != null ? parseFloat(r.current_weight) : null,
        target_weight: r.target_weight != null ? parseFloat(r.target_weight) : null,
        goal: r.goal,
        height_cm: r.height_cm,
        age: r.age,
        activity_level: r.activity_level,
        city: r.city,
        country: r.country || 'Казахстан',
      },
      weight_records_count: parseInt(weightCount.rows[0].count, 10),
      plans_count: parseInt(plansCount.rows[0].count, 10),
      last_activity,
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const result = await pool.query(
      'SELECT id, type, method, path, message, user_id, created_at FROM admin_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      type: r.type,
      method: r.method,
      path: r.path,
      message: r.message,
      user_id: r.user_id,
      created_at: r.created_at,
    })));
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 14, 31);
    const result = await pool.query(
      `SELECT d.date::date AS day,
              (SELECT COUNT(*) FROM weight_history wh WHERE wh.recorded_at::date = d.date) AS weights,
              (SELECT COUNT(*) FROM workout_plans wp WHERE wp.created_at::date = d.date) AS plans,
              (SELECT COUNT(*) FROM ai_messages am WHERE am.created_at::date = d.date) AS messages
       FROM generate_series(CURRENT_DATE - $1::int, CURRENT_DATE, '1 day'::interval) AS d(date)
       ORDER BY d.date`,
      [days - 1]
    );
    res.json(result.rows.map((r) => ({
      day: r.day,
      weights: parseInt(r.weights, 10),
      plans: parseInt(r.plans, 10),
      messages: parseInt(r.messages, 10),
      total: parseInt(r.weights, 10) + parseInt(r.plans, 10) + parseInt(r.messages, 10),
    })));
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['admin', 'client'].includes(role)) {
      return res.status(400).json({ error: 'Роль должна быть admin или client' });
    }
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя изменить свою роль' });
    }
    await pool.query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      role,
      id,
    ]);
    res.json({ message: 'Роль обновлена' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить себя' });
    }
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
