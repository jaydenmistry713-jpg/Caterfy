-- Let caterers mark which package is "Popular" (shown as a badge on all templates).
ALTER TABLE packages ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;
