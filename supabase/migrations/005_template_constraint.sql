ALTER TABLE caterer_pages DROP CONSTRAINT IF EXISTS caterer_pages_template_check;
ALTER TABLE caterer_pages ADD CONSTRAINT caterer_pages_template_check
  CHECK (template IN ('classic', 'modern', 'bold', 'linkpage'));
