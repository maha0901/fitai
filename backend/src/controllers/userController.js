const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');

exports.updateFitnessValidation = [
  body('current_weight').optional().isFloat({ min: 20, max: 300 }),
  body('target_weight').optional().isFloat({ min: 20, max: 300 }),
  body('goal').optional().trim().escape(),
  body('height_cm').optional().isInt({ min: 100, max: 250 }),
  body('age').optional().isInt({ min: 10, max: 120 }),
  body('activity_level').optional().isIn(['low', 'medium', 'high', 'very_high']),
  body('limitations').optional().trim().escape(),
  body('privacy_show_stats').optional().isBoolean(),
  body('country').optional().trim().escape(),
  body('city').optional().trim().escape(),
];

exports.getFitness = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_fitness WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      current_weight: row.current_weight != null ? parseFloat(row.current_weight) : null,
      target_weight: row.target_weight != null ? parseFloat(row.target_weight) : null,
      goal: row.goal,
      height_cm: row.height_cm,
      age: row.age,
      activity_level: row.activity_level,
      limitations: row.limitations,
      privacy_show_stats: row.privacy_show_stats != null ? row.privacy_show_stats : true,
      country: row.country || 'Казахстан',
      city: row.city,
      updated_at: row.updated_at,
    });
  } catch (err) {
    console.error('Get fitness error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.updateFitness = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { current_weight, target_weight, goal, height_cm, age, activity_level, limitations, privacy_show_stats, country, city } = req.body;
    const userId = req.user.id;

    const existing = await pool.query('SELECT id FROM user_fitness WHERE user_id = $1', [userId]);

    if (existing.rows.length > 0) {
      const updates = [];
      const values = [];
      let i = 1;
      if (current_weight !== undefined) { updates.push(`current_weight = $${i++}`); values.push(current_weight); }
      if (target_weight !== undefined) { updates.push(`target_weight = $${i++}`); values.push(target_weight); }
      if (goal !== undefined) { updates.push(`goal = $${i++}`); values.push(goal); }
      if (height_cm !== undefined) { updates.push(`height_cm = $${i++}`); values.push(height_cm); }
      if (age !== undefined) { updates.push(`age = $${i++}`); values.push(age); }
      if (activity_level !== undefined) { updates.push(`activity_level = $${i++}`); values.push(activity_level); }
      if (limitations !== undefined) { updates.push(`limitations = $${i++}`); values.push(limitations); }
      if (privacy_show_stats !== undefined) { updates.push(`privacy_show_stats = $${i++}`); values.push(privacy_show_stats); }
      if (country !== undefined) { updates.push(`country = $${i++}`); values.push(country); }
      if (city !== undefined) { updates.push(`city = $${i++}`); values.push(city); }
      if (updates.length === 0) {
        const r = await pool.query('SELECT * FROM user_fitness WHERE user_id = $1', [userId]);
        const row = r.rows[0];
        return res.json({
          current_weight: row.current_weight != null ? parseFloat(row.current_weight) : null,
          target_weight: row.target_weight != null ? parseFloat(row.target_weight) : null,
          goal: row.goal,
          height_cm: row.height_cm,
          age: row.age,
          activity_level: row.activity_level,
          limitations: row.limitations,
          privacy_show_stats: row.privacy_show_stats != null ? row.privacy_show_stats : true,
          country: row.country || 'Казахстан',
          city: row.city,
        });
      }
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);
      await pool.query(
        `UPDATE user_fitness SET ${updates.join(', ')} WHERE user_id = $${i}`,
        values
      );
      if (current_weight != null) {
        await pool.query(
          'INSERT INTO weight_history (user_id, weight) VALUES ($1, $2)',
          [userId, current_weight]
        );
      }
    } else {
      await pool.query(
        `INSERT INTO user_fitness (user_id, current_weight, target_weight, goal, height_cm, age, activity_level, limitations, privacy_show_stats, country, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [userId, current_weight ?? null, target_weight ?? null, goal ?? null, height_cm ?? null, age ?? null, activity_level ?? null, limitations ?? null, privacy_show_stats !== false, country || 'Казахстан', city ?? null]
      );
      if (current_weight != null) {
        await pool.query(
          'INSERT INTO weight_history (user_id, weight) VALUES ($1, $2)',
          [userId, current_weight]
        );
      }
    }

    const r = await pool.query('SELECT * FROM user_fitness WHERE user_id = $1', [userId]);
    const row = r.rows[0];
    res.json({
      current_weight: row.current_weight != null ? parseFloat(row.current_weight) : null,
      target_weight: row.target_weight != null ? parseFloat(row.target_weight) : null,
      goal: row.goal,
      height_cm: row.height_cm,
      age: row.age,
      activity_level: row.activity_level,
      limitations: row.limitations,
      privacy_show_stats: row.privacy_show_stats != null ? row.privacy_show_stats : true,
      country: row.country || 'Казахстан',
      city: row.city,
    });
  } catch (err) {
    console.error('Update fitness error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getWeightHistory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT weight, recorded_at FROM weight_history WHERE user_id = $1 ORDER BY recorded_at ASC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      weight: parseFloat(r.weight),
      recorded_at: r.recorded_at,
    })));
  } catch (err) {
    console.error('Get weight history error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.addWeightRecord = async (req, res) => {
  try {
    const { weight } = req.body;
    if (weight == null || isNaN(parseFloat(weight))) {
      return res.status(400).json({ error: 'Укажите вес' });
    }
    const w = parseFloat(weight);
    if (w < 20 || w > 300) {
      return res.status(400).json({ error: 'Некорректное значение веса' });
    }
    await pool.query(
      'INSERT INTO weight_history (user_id, weight) VALUES ($1, $2)',
      [req.user.id, w]
    );
    await pool.query(
      `INSERT INTO user_fitness (user_id, current_weight, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET current_weight = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, w]
    );
    res.status(201).json({ weight: w, recorded_at: new Date().toISOString() });
  } catch (err) {
    console.error('Add weight error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.getWorkoutPlans = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, created_by, created_at FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      created_by: r.created_by,
      created_at: r.created_at,
    })));
  } catch (err) {
    console.error('Get workout plans error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
