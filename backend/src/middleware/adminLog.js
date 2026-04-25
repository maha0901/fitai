const { pool } = require('../config/db');

async function logEntry(type, method, path, message, userId) {
  try {
    await pool.query(
      `INSERT INTO admin_logs (type, method, path, message, user_id) VALUES ($1, $2, $3, $4, $5)`,
      [type, method || null, path ? path.substring(0, 500) : null, message ? message.substring(0, 2000) : null, userId || null]
    );
  } catch (err) {
    console.error('Admin log write failed:', err);
  }
}

function adminLogMiddleware(req, res, next) {
  const userId = req.user?.id || null;
  logEntry('request', req.method, req.originalUrl, null, userId);
  next();
}

module.exports = { logEntry, adminLogMiddleware };
