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

  // Dizaynerlik arizalarini olish (Faqat haqiqiy ariza topshirganlarni)
  getPendingDesigners: async () => {
    const res = await pool.query(
      `SELECT dr.id as id, dr.portfolio_url, dr.experience_level, dr.created_at,
              u.id as user_id, u.name, u.email
       FROM designer_requests dr
       JOIN users u ON dr.user_id = u.id
       WHERE dr.status = 'pending'
       ORDER BY dr.created_at DESC`
    );
    return res.rows;
  },

  // Foydalanuvchini dizaynerga o'tkazish (Arizani tasdiqlash)
  approveDesigner: async (requestId) => {
    const reqRes = await pool.query('SELECT user_id FROM designer_requests WHERE id = $1', [requestId]);
    const userId = reqRes.rows.length > 0 ? reqRes.rows[0].user_id : requestId;

    await pool.query(`UPDATE designer_requests SET status = 'approved' WHERE id = $1 OR user_id = $1`, [requestId]);

    const res = await pool.query(
      `UPDATE users SET role = 'designer', is_approved_designer = TRUE 
       WHERE id = $1 RETURNING id, name, role`,
      [userId]
    );
    return res.rows[0];
  },

  // Dizaynerlik arizasini rad etish
  rejectDesigner: async (requestId) => {
    await pool.query(`UPDATE designer_requests SET status = 'rejected' WHERE id = $1`, [requestId]);
  }
};

module.exports = userModel;