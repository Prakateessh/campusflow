ALTER TABLE users ADD COLUMN password TEXT;
UPDATE users SET password = 'demo';