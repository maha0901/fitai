require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logEntry } = require('./middleware/adminLog');
const { metricsMiddleware, metricsHandler } = require('./metrics');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(metricsMiddleware);

app.use('/api', (req, res, next) => {
  if (req.originalUrl !== '/api/health') {
    logEntry('request', req.method, req.originalUrl, null, null).catch(() => {});
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', aiRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Fit AI Server' });
});

/** Prometheus scrape (no auth) */
app.get('/metrics', metricsHandler);

app.use((err, req, res, next) => {
  console.error(err);
  logEntry('error', req.method, req.originalUrl, err.message || String(err), req.user?.id).catch(() => {});
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Fit AI Server running on port ${PORT}`);
});
