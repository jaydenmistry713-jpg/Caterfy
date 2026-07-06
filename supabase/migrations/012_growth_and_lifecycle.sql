-- 012: growth & lifecycle
-- Adds signup attribution, link-share tracking, per-caterer page-view counts,
-- a lifecycle-email log (idempotency guard for the daily cron), and
-- review-request tracking on orders.

ALTER TABLE caterers ADD COLUMN IF NOT EXISTS signup_source TEXT;
ALTER TABLE caterers ADD COLUMN IF NOT EXISTS link_shared_at TIMESTAMP;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMP;

-- Daily page-view counts for caterer public pages
CREATE TABLE IF NOT EXISTS page_views (
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (caterer_id, date)
);
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
-- Caterers can read their own stats. There is deliberately no INSERT/UPDATE
-- policy — all writes go through the SECURITY DEFINER function below.
CREATE POLICY "Caterers read own page views" ON page_views
  FOR SELECT USING (auth.uid() = caterer_id);

CREATE OR REPLACE FUNCTION increment_page_view(p_caterer_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO page_views (caterer_id, date, views)
  VALUES (p_caterer_id, CURRENT_DATE, 1)
  ON CONFLICT (caterer_id, date)
  DO UPDATE SET views = page_views.views + 1;
$$;
GRANT EXECUTE ON FUNCTION increment_page_view(UUID) TO anon, authenticated;

-- One row per lifecycle email actually sent (unique key stops double-sends
-- if the cron runs more than once a day).
CREATE TABLE IF NOT EXISTS lifecycle_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id UUID REFERENCES caterers(id) ON DELETE CASCADE,
  email_key TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (caterer_id, email_key)
);
ALTER TABLE lifecycle_emails ENABLE ROW LEVEL SECURITY;
-- No policies: service-role access only.
