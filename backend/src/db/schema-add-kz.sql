-- Регион/город для реальных данных КЗ
ALTER TABLE user_fitness ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Казахстан';
ALTER TABLE user_fitness ADD COLUMN IF NOT EXISTS city VARCHAR(100);
