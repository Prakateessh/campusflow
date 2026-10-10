ALTER TABLE requests ADD COLUMN purpose TEXT;
ALTER TABLE requests ADD COLUMN return_by TEXT;

UPDATE facilities SET kind = 'store' WHERE id IN (3, 4, 5);