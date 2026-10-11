INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-06' AND u.email = 'l_vidhya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-02' AND u.email = 'j_aravinth@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-07' AND u.email = 'j_aravinth@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-08' AND u.email = 'm_navya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-09' AND u.email = 'j_rolantgini@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-03' AND u.email = 'a_baskar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-02' AND u.email = 'kp_peeyush@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-02' AND u.email = 's_umashankar@cb.amrita.edu';
