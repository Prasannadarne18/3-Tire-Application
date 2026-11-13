-- VanRaj Royal Hotel Management System
-- Database initialisation script

CREATE TABLE IF NOT EXISTS guests (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120)   NOT NULL,
    mobile      VARCHAR(20)    NOT NULL,
    room        VARCHAR(10)    NOT NULL,
    type        VARCHAR(20)    NOT NULL CHECK (type IN ('Standard','Deluxe','Suite','Presidential')),
    check_in    DATE           NOT NULL,
    check_out   DATE           NOT NULL,
    amount      NUMERIC(12,2)  NOT NULL DEFAULT 0,
    status      VARCHAR(20)    NOT NULL DEFAULT 'Reserved'
                               CHECK (status IN ('Reserved','Checked-in','Checked-out')),
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_dates CHECK (check_out > check_in)
);

CREATE INDEX IF NOT EXISTS idx_guests_status  ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_room    ON guests(room);

-- Seed data matching the React prototype
INSERT INTO guests (name, mobile, room, type, check_in, check_out, amount, status) VALUES
  ('Rajesh Sharma',  '+91 98765 43210', '101', 'Deluxe',       '2026-05-09', '2026-05-12',  4500,  'Checked-in'),
  ('Priya Patel',    '+91 87654 34109', '205', 'Suite',        '2026-05-08', '2026-05-15', 12000,  'Reserved'),
  ('Vijay Naik',     '+91 76543 21090', '312', 'Standard',     '2026-05-07', '2026-05-10',  2800,  'Checked-out'),
  ('Asha Kulkarni',  '+91 65432 10987', '401', 'Presidential', '2026-05-09', '2026-05-20', 35000,  'Checked-in')
ON CONFLICT DO NOTHING;
