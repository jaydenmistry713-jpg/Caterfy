-- Add business mode: 'full' = items + quotes, 'catering_only' = quotes only, 'items_only' = items only
ALTER TABLE caterers ADD COLUMN IF NOT EXISTS business_mode TEXT DEFAULT 'full';

-- Optional stock/inventory limit per menu item (NULL = unlimited)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_limit INTEGER;
