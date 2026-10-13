const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'svg_store',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  password: String(process.env.DB_PASSWORD || ''), // String ko'rinishiga o'tkazish
});

async function runMigration() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const seedsSql = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');

    console.log('🔄 Baza jadvallari yaratilmoqda...');
    await pool.query(schemaSql);
    
    console.log('🌱 Boshlang`ich ma`lumotlar yuklanmoqda...');
    await pool.query(seedsSql);

    console.log('✅ Ma`lumotlar bazasi muvaffaqiyatli tayyorlandi!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migratsiyada xatolik:', err);
    process.exit(1);
  }
}

runMigration();
