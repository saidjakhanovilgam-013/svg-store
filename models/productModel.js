const pool = require('../config/db');

const productModel = {
  // Tasdiqlangan barcha mahsulotlarni filtrlar bilan olish
  getAllApproved: async ({ category, min_price, max_price, search }) => {
    let query = `
      SELECT p.*, u.name as designer_name, c.name as category_name
      FROM products p
      JOIN users u ON p.designer_id = u.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'approved'
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.slug = $${params.length}`;
    }

    if (min_price) {
      params.push(min_price);
      query += ` AND p.price >= $${params.length}`;
    }

    if (max_price) {
      params.push(max_price);
      query += ` AND p.price <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const res = await pool.query(query, params);
    return res.rows;
  },

  // ID bo'yicha olish (Detail sahifasi uchun)
  findById: async (id) => {
    const res = await pool.query(
      `SELECT p.*, u.name as designer_name, c.name as category_name
       FROM products p
       JOIN users u ON p.designer_id = u.id
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );
    return res.rows[0];
  },

  // IDlar ro'yxati bo'yicha mahsulotlarni olish (Savat uchun)
  findByIds: async (ids) => {
    if (!ids || ids.length === 0) return [];
    const res = await pool.query(
      `SELECT p.id, p.title, p.price, p.preview_svg_path, u.name as designer_name
       FROM products p
       JOIN users u ON p.designer_id = u.id
       WHERE p.id = ANY($1::int[])`,
      [ids]
    );
    return res.rows;
  },

  // Yangi SVG yuklash
  create: async ({ designer_id, category_id, title, description, price, preview_svg_path, file_zip_path }) => {
    const res = await pool.query(
      `INSERT INTO products (designer_id, category_id, title, description, price, preview_svg_path, file_zip_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [designer_id, category_id, title, description, price, preview_svg_path, file_zip_path]
    );
    return res.rows[0];
  },

  // Dizaynerning o'z mahsulotlarini olish
  getByDesignerId: async (designerId) => {
    const res = await pool.query(
      `SELECT * FROM products WHERE designer_id = $1 ORDER BY created_at DESC`,
      [designerId]
    );
    return res.rows;
  },

  // Admin uchun moderatsiyada turgan mahsulotlar
  getPendingProducts: async () => {
    const res = await pool.query(
      `SELECT p.*, u.name as designer_name 
       FROM products p
       JOIN users u ON p.designer_id = u.id
       WHERE p.status = 'pending' ORDER BY p.created_at ASC`
    );
    return res.rows;
  },

  // Statusni o'zgartirish (approved / rejected)
  updateStatus: async (id, status) => {
    const res = await pool.query(
      `UPDATE products SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return res.rows[0];
  },

  // Ko'rishlar sonini oshirish
  incrementViews: async (id) => {
    await pool.query(`UPDATE products SET views_count = views_count + 1 WHERE id = $1`, [id]);
  }
};

module.exports = productModel;