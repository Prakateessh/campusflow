-- ═══════════════════════════════════════════════════════════════
-- Facility contacts — split into 3 batches to fit D1's compound SELECT limit
-- Run: wrangler d1 execute campusflow-db --file=./rebuild_contacts.sql --remote
-- ═══════════════════════════════════════════════════════════════

DELETE FROM facility_contacts;

-- Batch 1: 11 rows
INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-01' AND u.email = 'p_sudheesh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-01' AND u.email = 'bn_prashanth@blr.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-02' AND u.email = 'idealab@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-01' AND u.email = 'c_lakshmik@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-02' AND u.email = 'a_arun@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-03' AND u.email = 's_natarajamani@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-04' AND u.email = 's_adarsh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-05' AND u.email = 'ks_anusha@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-06' AND u.email = 'l_vidhya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-02' AND u.email = 'j_aravinth@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-07' AND u.email = 'j_aravinth@cb.amrita.edu';

-- Batch 2: 11 rows
INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-08' AND u.email = 'm_navya@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-09' AND u.email = 'j_rolantgini@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-03' AND u.email = 'a_baskar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-02' AND u.email = 'kp_peeyush@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-02' AND u.email = 's_umashankar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'N-03' AND u.email = 'm_akhil1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'vm_akhil@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-03' AND u.email = 'v_amrutha1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 'j_govindarajan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-04' AND u.email = 's_vishnu1@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'C-05' AND u.email = 'b_rajathilagam@cb.amrita.edu';

-- Batch 3: 10 rows
INSERT INTO facility_contacts (facility_id, user_id)
SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'CH-02' AND u.email = 'bala@am.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-10' AND u.email = 'n_mohankumar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-11' AND u.email = 's_krithiga@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'E-12' AND u.email = 'n_madhumohan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-04' AND u.email = 'm_saimurugan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'I-04' AND u.email = 'krishna@amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-05' AND u.email = 'a_sumesh@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-05' AND u.email = 'r_senthilkumar@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-06' AND u.email = 'ar_vijayanarayanan@cb.amrita.edu'
UNION ALL SELECT f.id, u.id FROM facilities f, users u WHERE f.code = 'M-06' AND u.email = 'k_srinivasan@cb.amrita.edu';