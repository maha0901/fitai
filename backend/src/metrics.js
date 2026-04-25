/**
 * Prometheus metrics for Fit AI Server (Grafana / Prometheus scrape).
 */
const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'fit_ai_',
  labels: { app: 'fit-ai-server' },
});

const httpRequestsTotal = new client.Counter({
  name: 'fit_ai_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'fit_ai_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/** Reduce cardinality: hide UUIDs and numeric IDs in path */
function normalizeRoute(path) {
  if (!path || path === '/') return path || '/';
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id');
}

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationSec = Number(process.hrtime.bigint() - start) / 1e9;
    const route = normalizeRoute(req.baseUrl + (req.route?.path || req.path || 'unknown'));
    const labels = {
      method: req.method,
      route: route || 'unknown',
      status_code: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, durationSec);
  });

  next();
}

async function metricsHandler(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler,
};
