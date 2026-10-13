const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL ulanish parametrlari
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'svg_store',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Bir vaqtning o'zida maksimal ulanishlar soni
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Bazaga ulanishni tekshirish
pool.on('connect', () => {
  console.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandi');
});

pool.on('error', (err) => {
  console.error('❌ Baza ulanishida kutilmagan xatolik:', err);
  process.exit(-1);
});

module.exports = pool;