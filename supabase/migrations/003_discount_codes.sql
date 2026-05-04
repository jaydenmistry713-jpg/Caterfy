-- Discount codes per caterer
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caterer_id UUID NOT NULL REFERENCES caterers(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value DECIMAL(10,2),
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (caterer_id, code)
);

-- Track discount on orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);

-- RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caterers manage own discount codes"
  ON discount_codes FOR ALL
  USING (caterer_id = auth.uid())
  WITH CHECK (caterer_id = auth.uid());
