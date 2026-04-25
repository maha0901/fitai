const { pool } = require('../config/db');
const { body, validationResult } = require('express-validator');

// Simulated AI response (in production you would call OpenAI/Claude API)
function generateAIPlan(userMessage, userContext) {
  const goals = userContext?.goal || 'улучшить форму';
  const weight = userContext?.current_weight || 70;
  const target = userContext?.target_weight || 65;
  const level = userContext?.activity_level || 'medium';

  const plans = {
    low: ['Ходьба 30 мин', 'Лёгкая разминка', 'Растяжка'],
    medium: ['Бег 20 мин', 'Силовые 3x10', 'Планка 1 мин'],
    high: ['Интервалы 25 мин', 'Силовые 4x12', 'Бурпи 3 подхода'],
    very_high: ['HIIT 30 мин', 'Кроссфит блок', 'Кардио + сила'],
  };
  const exercises = plans[level] || plans.medium;

  const plan = `
План на основе ваших данных:
- Цель: ${goals}
- Текущий вес: ${weight} кг, цель: ${target} кг
- Уровень активности: ${level}

Рекомендуемые упражнения на сегодня:
1. ${exercises[0]}
2. ${exercises[1]}
3. ${exercises[2]}

Совет: соблюдайте режим питания и пейте достаточно воды. Записывайте прогресс в приложении.
  `.trim();

  return plan;
}

exports.aiPlanValidation = [
  body('message').optional().trim().escape(),
];

exports.getAiPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body || {};
    const userId = req.user.id;

    const fitnessResult = await pool.query(
      'SELECT current_weight, target_weight, goal, activity_level FROM user_fitness WHERE user_id = $1',
      [userId]
    );
    const fitness = fitnessResult.rows[0] || null;
    const userContext = fitness ? {
      current_weight: parseFloat(fitness.current_weight),
      target_weight: fitness.target_weight != null ? parseFloat(fitness.target_weight) : null,
      goal: fitness.goal,
      activity_level: fitness.activity_level,
    } : null;

    const aiResponse = generateAIPlan(message || 'Дай мне план тренировки', userContext);

    await pool.query(
      'INSERT INTO ai_messages (user_id, role, content) VALUES ($1, $2, $3), ($1, $4, $5)',
      [userId, 'user', message || 'Дай план', 'assistant', aiResponse]
    );

    const planResult = await pool.query(
      `INSERT INTO workout_plans (user_id, title, content, created_by)
       VALUES ($1, $2, $3, 'ai')
       RETURNING id, title, content, created_at`,
      [userId, 'План от Fit AI', aiResponse]
    );
    const plan = planResult.rows[0];

    res.json({
      plan: {
        id: plan.id,
        title: plan.title,
        content: plan.content,
        created_at: plan.created_at,
      },
      message: aiResponse,
    });
  } catch (err) {
    console.error('AI plan error:', err);
    res.status(500).json({ error: 'Ошибка при генерации плана' });
  }
};

exports.chatValidation = [
  body('message').notEmpty().trim().escape().withMessage('Введите сообщение'),
];

exports.chat = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message } = req.body;
    const userId = req.user.id;

    await pool.query(
      'INSERT INTO ai_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [userId, 'user', message]
    );

    const fitnessResult = await pool.query(
      'SELECT current_weight, target_weight, goal, activity_level FROM user_fitness WHERE user_id = $1',
      [userId]
    );
    const fitness = fitnessResult.rows[0] || null;
    const userContext = fitness ? {
      current_weight: parseFloat(fitness.current_weight),
      target_weight: fitness.target_weight != null ? parseFloat(fitness.target_weight) : null,
      goal: fitness.goal,
      activity_level: fitness.activity_level,
    } : null;

    const aiResponse = generateAIPlan(message, userContext);

    await pool.query(
      'INSERT INTO ai_messages (user_id, role, content) VALUES ($1, $2, $3)',
      [userId, 'assistant', aiResponse]
    );

    res.json({
      reply: aiResponse,
      role: 'assistant',
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Ошибка AI' });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT role, content, created_at FROM ai_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      role: r.role,
      content: r.content,
      created_at: r.created_at,
    })));
  } catch (err) {
    console.error('Get chat history error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
