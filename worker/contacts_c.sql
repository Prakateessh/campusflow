INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-03' AND u.email = 'm_akhil1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'vm_akhil@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'v_amrutha1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 'j_govindarajan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 's_vishnu1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-05' AND u.email = 'b_rajathilagam@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'CH-02' AND u.email = 'bala@am.amrita.edu';
