-- Optional min/max guest count a caterer will take for catering quote requests.
ALTER TABLE caterers ADD COLUMN IF NOT EXISTS min_catering_guests INTEGER;
ALTER TABLE caterers ADD COLUMN IF NOT EXISTS max_catering_guests INTEGER;
