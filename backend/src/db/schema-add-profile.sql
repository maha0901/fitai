-- Run this if your DB was created before limitations/privacy_show_stats were added
ALTER TABLE user_fitness ADD COLUMN IF NOT EXISTS limitations TEXT;
ALTER TABLE user_fitness ADD COLUMN IF NOT EXISTS privacy_show_stats BOOLEAN DEFAULT true;
