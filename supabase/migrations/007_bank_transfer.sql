ALTER TABLE caterers
  ADD COLUMN IF NOT EXISTS bank_transfer_details TEXT,
  ADD COLUMN IF NOT EXISTS show_bank_details_on_invoice BOOLEAN DEFAULT TRUE;
