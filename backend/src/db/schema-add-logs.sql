CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  method VARCHAR(10),
  path VARCHAR(500),
  message TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
