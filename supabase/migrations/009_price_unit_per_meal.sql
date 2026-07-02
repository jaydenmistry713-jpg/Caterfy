-- Allow 'per meal' as a menu item price unit (caterers selling whole meals).
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_price_unit_check;
ALTER TABLE menu_items
  ADD CONSTRAINT menu_items_price_unit_check
  CHECK (price_unit IN ('per person', 'per item', 'per meal', 'flat'));
