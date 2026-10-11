-- ═══════════════════════════════════════════════════════════════
-- Sports equipment inventory for Sports Materials (facility id 42)
-- Run: wrangler d1 execute campusflow-db --file=./seed_sports.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM inventory WHERE facility_id = 42;

INSERT INTO inventory
  (facility_id, sku, name, kind, quantity_total, quantity_available,
   unit, requires_return, return_days, notes)
VALUES
  (42, 'BAD-RKT',     'Badminton Racket',            'sports_equipment', 20, 20, 'piece', 1, 1,    'Yonex GR-303, carbon frame'),
  (42, 'SHUTTLE',     'Shuttlecock (tube of 6)',     'sports_equipment', 40, 40, 'tube',  0, NULL, 'Yonex Mavis 350, nylon'),
  (42, 'CRICKET-BAT', 'Cricket Bat',                 'sports_equipment', 8,  8,  'piece', 1, 1,    'Kashmir willow, size SH'),
  (42, 'CRICKET-BALL','Cricket Ball (leather)',      'sports_equipment', 15, 15, 'piece', 1, 1,    'Red leather, 156g'),
  (42, 'WK-GLOVES',   'Wicket Keeping Gloves',       'sports_equipment', 4,  4,  'pair',  1, 1,    'Padded palm, adult size'),
  (42, 'FOOTBALL',    'Football',                    'sports_equipment', 10, 10, 'piece', 1, 1,    'Nivia Storm, size 5'),
  (42, 'GK-GLOVES',   'Goalkeeper Gloves',           'sports_equipment', 4,  4,  'pair',  1, 1,    'Latex palm, size L'),
  (42, 'BASKETBALL',  'Basketball',                  'sports_equipment', 8,  8,  'piece', 1, 1,    'Spalding NBA, size 7'),
  (42, 'VOLLEYBALL',  'Volleyball',                  'sports_equipment', 6,  6,  'piece', 1, 1,    'Nivia, size 5'),
  (42, 'TENNIS-RKT',  'Tennis Racket',               'sports_equipment', 10, 10, 'piece', 1, 1,    'Wilson Pro Staff, 300g'),
  (42, 'TENNIS-BALL', 'Tennis Ball (can of 3)',      'sports_equipment', 30, 30, 'can',   0, NULL, 'Wilson Championship'),
  (42, 'TT-PADDLE',   'Table Tennis Paddle',         'sports_equipment', 12, 12, 'piece', 1, 1,    'GKI Euro, ITTF approved'),
  (42, 'TT-BALL',     'Table Tennis Ball (box of 6)','sports_equipment', 20, 20, 'box',   0, NULL, 'Stag, 40mm, white'),
  (42, 'STOPWATCH',   'Stopwatch',                   'sports_equipment', 12, 12, 'piece', 1, 1,    'Digital, split-timing, 1/100s'),
  (42, 'TAPE-100M',   'Measuring Tape (100m)',       'sports_equipment', 3,  3,  'piece', 1, 1,    'Fibreglass, wind-resistant');