const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function migrateCustomOrders() {
  try {
    const migrationSql = fs.readFileSync(
      path.join(__dirname, 'migrations', '001_custom_orders.sql'),
      'utf8'
    );

    await pool.query(migrationSql);
    console.log('✅ Maxsus buyurtmalar bazasi muvaffaqiyatli yangilandi.');
  } catch (err) {
    console.error('❌ Maxsus buyurtmalar migratsiyasida xatolik:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrateCustomOrders();
