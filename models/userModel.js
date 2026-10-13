const pool = require('../config/db');

const userModel = {
  // Email orqali topish
  findByEmail: async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  // ID orqali topish
  findById: async (id) => {
    const res = await pool.query('SELECT id, name, email, role, is_approved_designer, created_at FROM users WHERE id = $1', [id]);
    return res.rows[0];
  },

  // Google ID orqali topish
  findByGoogleId: async (googleId) => {
    const res = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    return res.rows[0];
  },

  // Yangi foydalanuvchi yaratish (Register)
  create: async ({ name, email, password_hash, google_id = null, role = 'buyer' }) => {
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, google_id, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, password_hash, google_id, role]
    );
    return res.rows[0];
  },

  // Dizaynerlik arizalarini olish
  getPendingDesigners: async () => {
    const res = await pool.query(
      `SELECT id, name, email, created_at FROM users 
       WHERE role = 'buyer' AND is_approved_designer = FALSE ORDER BY created_at DESC`
    );
    return res.rows;
  },

  // Foydalanuvchini dizaynerga o'tkazish
  approveDesigner: async (userId) => {
    const res = await pool.query(
      `UPDATE users SET role = 'designer', is_approved_designer = TRUE 
       WHERE id = $1 RETURNING id, name, role`,
      [userId]
    );
    return res.rows[0];
  }
};

module.exports = userModel;