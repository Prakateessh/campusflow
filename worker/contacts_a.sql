INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-01' AND u.email = 'p_sudheesh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-01' AND u.email = 'bn_prashanth@blr.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-02' AND u.email = 'idealab@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-01' AND u.email = 'c_lakshmik@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-02' AND u.email = 'a_arun@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-03' AND u.email = 's_natarajamani@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-04' AND u.email = 's_adarsh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-05' AND u.email = 'ks_anusha@cb.amrita.edu';
