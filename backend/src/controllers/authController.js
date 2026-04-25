const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
  body('full_name').optional().trim().escape(),
  body('role').optional().isIn(['admin', 'client']).withMessage('Роль: admin или client'),
];

exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
];

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name, role = 'client' } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, full_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, full_name, created_at`,
      [email, password_hash, role, full_name || null]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT id, email, password_hash, role, full_name FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Вход выполнен',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
      token,
      expiresIn: JWT_EXPIRES_IN,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.created_at,
              uf.current_weight, uf.target_weight, uf.goal, uf.height_cm, uf.age, uf.activity_level,
              uf.limitations, uf.privacy_show_stats, uf.country, uf.city
       FROM users u
       LEFT JOIN user_fitness uf ON u.id = uf.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    const row = result.rows[0];
    const user = {
      id: row.id,
      email: row.email,
      role: row.role,
      full_name: row.full_name,
      created_at: row.created_at,
      fitness: row.current_weight != null || row.goal != null ? {
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
      } : null,
    };
    res.json(user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
