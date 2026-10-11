PRAGMA foreign_keys = OFF;
DELETE FROM notifications;
DELETE FROM canteen_orders;
DELETE FROM approvals;
DELETE FROM request_items;
DELETE FROM requests;
DELETE FROM library_loans;
DELETE FROM users;
DELETE FROM sqlite_sequence WHERE name IN ('users','requests','request_items','approvals','canteen_orders','notifications','library_loans');
PRAGMA foreign_keys = ON;

INSERT INTO users (email, name, role, department, password) VALUES
  ('p_sudheesh@cb.amrita.edu',      'Sudheesh P.',               'faculty', 'ECE',        'demo'),
  ('bn_prashanth@blr.amrita.edu',   'Dr. Prashanth B. N.',       'faculty', 'MECH',       'demo'),
  ('idealab@cb.amrita.edu',         'Dr. Sasangan Ramanathan',   'faculty', 'Innovation', 'demo'),
  ('c_lakshmik@cb.amrita.edu',      'Mr. C. Lakshmikanthan',     'faculty', 'MECH',       'demo'),
  ('a_arun@cb.amrita.edu',          'Dr. Arun A.',               'faculty', 'MECH',       'demo'),
  ('s_natarajamani@cb.amrita.edu',  'Dr. Natarajamani S.',       'faculty', 'ECE',        'demo'),
  ('s_adarsh@cb.amrita.edu',        'Dr. Adarsh S.',             'faculty', 'ECE',        'demo'),
  ('ks_anusha@cb.amrita.edu',       'Dr. Anusha K. S.',          'faculty', 'ECE',        'demo'),
  ('l_vidhya@cb.amrita.edu',        'Vidya L',                   'faculty', 'ECE',        'demo'),
  ('j_aravinth@cb.amrita.edu',      'Dr. J. Aravinth',           'faculty', 'ECE',        'demo'),
  ('m_navya@cb.amrita.edu',         'Dr. Navya Mohan',           'faculty', 'ECE',        'demo');
