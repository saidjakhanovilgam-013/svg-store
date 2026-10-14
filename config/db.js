const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// PostgreSQL ulanish parametrlari
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Bir vaqtning o'zida maksimal ulanishlar soni
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000, // Vercel uchun ulanish vaqtini biroz uzaytirdik
  // Vercel serverlarida SSL ulanishni majburiy qilish
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Bazaga ulanishni tekshirish
pool.on('connect', () => {
  console.log('✅ PostgreSQL ma\'lumotlar bazasiga muvaffaqiyatli ulandi');
});

pool.on('error', (err) => {
  console.error('❌ Baza ulanishida kutilmagan xatolik:', err);
  // Vercel Serverless muhitida xatolik tufayli butun jarayonni o'ldirmaslik kerak
  if (!isProduction) {
    process.exit(-1);
  }
});

module.exports = pool;