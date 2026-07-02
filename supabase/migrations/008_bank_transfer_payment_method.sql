-- Allow 'bank_transfer' as an order payment method.
-- The original orders_payment_method_check only permitted ('card', 'offline'),
-- which caused inserts with payment_method = 'bank_transfer' to fail with
-- "new row for relation orders violates check constraint orders_payment_method_check".
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('card', 'offline', 'bank_transfer'));

-- Let the public order form read a caterer's blocked dates so it can prevent
-- customers from selecting an unavailable date. (Blocked dates were previously
-- only readable by the owning caterer, so the customer-facing form could not see them.)
DROP POLICY IF EXISTS "Public can read blocked dates" ON blocked_dates;
CREATE POLICY "Public can read blocked dates" ON blocked_dates FOR SELECT USING (true);
