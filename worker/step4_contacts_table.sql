DROP TABLE IF EXISTS facility_contacts;

CREATE TABLE facility_contacts (
  facility_id INTEGER NOT NULL REFERENCES facilities(id),
  user_id     INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (facility_id, user_id)
);

CREATE INDEX idx_contacts_user ON facility_contacts(user_id);
