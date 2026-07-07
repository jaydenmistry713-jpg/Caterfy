-- 013: add the 'maison' template (template 5 — editorial, curated palettes)
-- Palette selection lives in caterer_pages.template_data.maison (JSONB), so
-- the only schema change is widening the template check constraint.

ALTER TABLE caterer_pages DROP CONSTRAINT IF EXISTS caterer_pages_template_check;
ALTER TABLE caterer_pages ADD CONSTRAINT caterer_pages_template_check
  CHECK (template IN ('classic', 'modern', 'bold', 'linkpage', 'maison'));
