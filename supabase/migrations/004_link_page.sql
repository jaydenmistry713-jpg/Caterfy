ALTER TABLE caterer_pages ADD COLUMN IF NOT EXISTS template_data JSONB DEFAULT '{}'::jsonb;
