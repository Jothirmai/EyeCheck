// migrate.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE images
      ADD COLUMN IF NOT EXISTS blurScore FLOAT,
      ADD COLUMN IF NOT EXISTS exposureStatus TEXT,
      ADD COLUMN IF NOT EXISTS shadowClip FLOAT,
      ADD COLUMN IF NOT EXISTS highlightClip FLOAT,
      ADD COLUMN IF NOT EXISTS dynamicRange FLOAT;
    `);
    console.log("✅ Migration complete: Columns added");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await pool.end();
  }
}

migrate();
