-- Cuisine types
INSERT INTO cuisines (name, slug) VALUES
  ('African', 'african'),
  ('American', 'american'),
  ('British', 'british'),
  ('Caribbean', 'caribbean'),
  ('Chinese', 'chinese'),
  ('French', 'french'),
  ('Greek', 'greek'),
  ('Indian', 'indian'),
  ('Italian', 'italian'),
  ('Japanese', 'japanese'),
  ('Korean', 'korean'),
  ('Lebanese / Middle Eastern', 'lebanese-middle-eastern'),
  ('Mexican', 'mexican'),
  ('Spanish', 'spanish'),
  ('Thai', 'thai'),
  ('Turkish', 'turkish'),
  ('Vietnamese', 'vietnamese'),
  ('Vegan / Plant-based', 'vegan-plant-based'),
  ('BBQ / Grill', 'bbq-grill'),
  ('Seafood', 'seafood'),
  ('Desserts / Cakes', 'desserts-cakes'),
  ('Multi-cuisine / Fusion', 'multi-cuisine-fusion'),
  ('Other', 'other');

-- Event types
INSERT INTO event_types (name, slug) VALUES
  ('Wedding', 'wedding'),
  ('Corporate / Business', 'corporate-business'),
  ('Birthday party', 'birthday-party'),
  ('Private party', 'private-party'),
  ('Funeral / Wake', 'funeral-wake'),
  ('Baby shower', 'baby-shower'),
  ('Graduation', 'graduation'),
  ('Holiday party', 'holiday-party'),
  ('Festival / Outdoor event', 'festival-outdoor-event'),
  ('Dinner party', 'dinner-party'),
  ('Brunch / Breakfast event', 'brunch-breakfast-event'),
  ('Other', 'other');

-- Dietary options
INSERT INTO dietary_options (name) VALUES
  ('Vegetarian'),
  ('Vegan'),
  ('Halal'),
  ('Kosher'),
  ('Gluten-free'),
  ('Dairy-free'),
  ('Nut-free'),
  ('Other allergies catered');

-- Sample UK locations
INSERT INTO locations (name, slug, country, latitude, longitude) VALUES
  ('London', 'london', 'UK', 51.50735, -0.12776),
  ('Birmingham', 'birmingham', 'UK', 52.48142, -1.89983),
  ('Manchester', 'manchester', 'UK', 53.48095, -2.23743),
  ('Leeds', 'leeds', 'UK', 53.79648, -1.54785),
  ('Liverpool', 'liverpool', 'UK', 53.41058, -2.97794),
  ('Sheffield', 'sheffield', 'UK', 53.38113, -1.47009),
  ('Bristol', 'bristol', 'UK', 51.45523, -2.59665),
  ('Glasgow', 'glasgow', 'UK', 55.86515, -4.25763),
  ('Edinburgh', 'edinburgh', 'UK', 55.95206, -3.19648),
  ('Cardiff', 'cardiff', 'UK', 51.48158, -3.17909),
  ('Leicester', 'leicester', 'UK', 52.63662, -1.13423),
  ('Nottingham', 'nottingham', 'UK', 52.95397, -1.15641),
  ('Newcastle upon Tyne', 'newcastle', 'UK', 54.97328, -1.61396),
  ('Bradford', 'bradford', 'UK', 53.79391, -1.75182),
  ('Coventry', 'coventry', 'UK', 52.40656, -1.51217),
  ('Brighton', 'brighton', 'UK', 50.82253, -0.13756),
  ('Oxford', 'oxford', 'UK', 51.75202, -1.25773),
  ('Cambridge', 'cambridge', 'UK', 52.20535, 0.11912),
  ('Southampton', 'southampton', 'UK', 50.90395, -1.40428),
  ('Portsmouth', 'portsmouth', 'UK', 50.79899, -1.09125),
  -- US locations
  ('New York', 'new-york', 'US', 40.71278, -74.00594),
  ('Los Angeles', 'los-angeles', 'US', 34.05223, -118.24368),
  ('Chicago', 'chicago', 'US', 41.85003, -87.65005),
  ('Houston', 'houston', 'US', 29.76328, -95.36327),
  ('Philadelphia', 'philadelphia', 'US', 39.95233, -75.16379),
  ('Miami', 'miami', 'US', 25.77427, -80.19366),
  ('Atlanta', 'atlanta', 'US', 33.74900, -84.38798),
  ('Dallas', 'dallas', 'US', 32.78306, -96.80667),
  ('Washington DC', 'washington-dc', 'US', 38.90719, -77.03687),
  ('Boston', 'boston', 'US', 42.35843, -71.05977);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('subscription_price_uk', '{"amount": 1000, "currency": "gbp"}'),
  ('subscription_price_us', '{"amount": 1200, "currency": "usd"}'),
  ('trial_days', '14');
