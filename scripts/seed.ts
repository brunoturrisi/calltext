import { query } from "../src/lib/db";

// Check if Bar Centrale exists
const existing = query(`SELECT id FROM businesses WHERE slug = 'bar-centrale' LIMIT 1`);
if (existing.length === 0) {
  query(`INSERT INTO businesses (slug, name, access_code) VALUES ('bar-centrale', 'Bar Centrale', '1234')`);
  query(`INSERT INTO call_logs (id, caller_number, call_sid, status, business_slug, created_at) VALUES (lower(hex(randomblob(16))), '+39 345 678 9012', 'CA123', 'missed', 'bar-centrale', datetime('now', '-2 hours'))`);
  query(`INSERT INTO call_logs (id, caller_number, call_sid, status, business_slug, created_at) VALUES (lower(hex(randomblob(16))), '+39 333 123 4567', 'CA456', 'missed', 'bar-centrale', datetime('now', '-1 hours'))`);
  query(`INSERT INTO leads (business_slug, name, interest, status) VALUES ('bar-centrale', 'Mario Rossi', 'Vorrei prenotare un tavolo per 4 sabato sera', 'new')`);
  query(`INSERT INTO leads (business_slug, name, interest, status) VALUES ('bar-centrale', 'Anna Bianchi', 'Quanto costa un aperitivo per 10 persone?', 'new')`);
  console.log("✅ Demo business 'Bar Centrale' seeded!");
} else {
  console.log("ℹ️ Bar Centrale already exists, skipping seed.");
}
