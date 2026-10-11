-- ═══════════════════════════════════════════════════════════════
-- Sports equipment inventory — facility 42 (G-07 Sports Materials)
-- Run: wrangler d1 execute campusflow-db --file=./seed_sports.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM inventory WHERE facility_id = 42;

INSERT INTO inventory
  (facility_id, sku, name, kind, quantity_total, quantity_available,
   unit, requires_return, return_days, notes)
VALUES
  (42, 'FOOTBALL',       'Football',                'sports_equipment', 15, 15, 'piece', 1, NULL, 'Size 5 football for outdoor matches'),
  (42, 'BASKETBALL',     'Basketball',              'sports_equipment', 12, 12, 'piece', 1, NULL, 'Basketball for court games and practice'),
  (42, 'VOLLEYBALL',     'Volleyball',              'sports_equipment', 14, 14, 'piece', 1, NULL, 'Volleyball for indoor and outdoor games'),
  (42, 'CRICKET-BAT',    'Cricket Bat',             'sports_equipment', 8,  8,  'piece', 1, NULL, 'Wooden bat for cricket practice and matches'),
  (42, 'CRICKET-BALL',   'Cricket Ball',            'sports_equipment', 20, 20, 'piece', 1, NULL, 'Cricket ball for practice and matches'),
  (42, 'CRICKET-STUMPS', 'Cricket Stumps Set',      'sports_equipment', 6,  6,  'set',   1, NULL, 'Set of three stumps and two bails'),
  (42, 'BATTING-GLOVES', 'Batting Gloves',          'sports_equipment', 10, 10, 'pair',  1, NULL, 'Protective gloves for cricket batting'),
  (42, 'BADMINTON-RKT',  'Badminton Racket',        'sports_equipment', 18, 18, 'piece', 1, NULL, 'Racket for badminton practice and matches'),
  (42, 'BADMINTON-SHUT', 'Badminton Shuttlecocks',  'sports_equipment', 25, 25, 'pack',  1, NULL, 'Pack of shuttlecocks for badminton'),
  (42, 'TT-BAT',         'Table Tennis Bat',        'sports_equipment', 12, 12, 'piece', 1, NULL, 'Bat for table tennis practice'),
  (42, 'TT-BALLS',       'Table Tennis Balls',      'sports_equipment', 30, 30, 'pack',  1, NULL, 'Pack of balls for table tennis'),
  (42, 'TENNIS-RKT',     'Tennis Racket',           'sports_equipment', 7,  7,  'piece', 1, NULL, 'Racket for tennis practice and matches'),
  (42, 'SKIPPING-ROPE',  'Skipping Rope',           'sports_equipment', 25, 25, 'piece', 1, NULL, 'Adjustable rope for fitness and warm-ups'),
  (42, 'YOGA-MAT',       'Yoga Mat',                'sports_equipment', 15, 15, 'piece', 1, NULL, 'Non-slip mat for yoga and stretching'),
  (42, 'RESISTANCE-BAND','Resistance Bands',        'sports_equipment', 12, 12, 'set',   1, NULL, 'Bands for strength and flexibility training'),
  (42, 'DUMBBELLS',      'Dumbbells',               'sports_equipment', 8,  8,  'pair',  1, NULL, 'Pair of dumbbells for strength training'),
  (42, 'SPORTS-CONES',   'Sports Cones',            'sports_equipment', 15, 15, 'set',   1, NULL, 'Set of cones for drills and field marking'),
  (42, 'AGILITY-LADDER', 'Agility Ladder',          'sports_equipment', 5,  5,  'piece', 1, NULL, 'Ladder for speed and coordination training'),
  (42, 'WHISTLE',        'Sports Whistle',          'sports_equipment', 20, 20, 'piece', 1, NULL, 'Whistle for referees and sports instructors'),
  (42, 'MINI-HURDLES',   'Mini Training Hurdles',   'sports_equipment', 6,  6,  'set',   1, NULL, 'Hurdles for agility and speed drills'),
  (42, 'GK-GLOVES',      'Goalkeeper Gloves',       'sports_equipment', 8,  8,  'pair',  1, NULL, 'Grip-enhanced gloves for football goalkeepers'),
  (42, 'KNEE-PADS',      'Knee Pads',               'sports_equipment', 10, 10, 'pair',  1, NULL, 'Protective knee pads for sports activities'),
  (42, 'SPORTS-BIBS',    'Sports Bibs',             'sports_equipment', 10, 10, 'set',   1, NULL, 'Colored bibs for identifying teams during practice'),
  (42, 'BALL-PUMP',      'Ball Pump',               'sports_equipment', 10, 10, 'piece', 1, NULL, 'Manual pump for inflating sports balls'),
  (42, 'FIRST-AID-KIT',  'Sports First Aid Kit',    'sports_equipment', 5,  5,  'kit',   1, NULL, 'Basic first aid supplies for sports activities');