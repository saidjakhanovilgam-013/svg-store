const pool = require('../config/db');

// Profil sahifasini ko'rsatish
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query(
      'SELECT id, name, email, role, avatar_url, phone, bio, card_number FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Xaridlar tarixi (o.user_id o'rniga o.buyer_id ishlatildi)
    const purchasesResult = await pool.query(
      `SELECT p.id, p.title, p.price, p.preview_svg_path, o.created_at 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       JOIN products p ON oi.product_id = p.id 
       WHERE o.buyer_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );

    // Dizaynerlik arizasi holatini tekshirish
    const reqResult = await pool.query(
      'SELECT status FROM designer_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const designerRequest = reqResult.rows[0];

    res.render('profile/index', {
      title: 'Shaxsiy Kabinet',
      user,
      purchases: purchasesResult.rows,
      designerRequest
    });
  } catch (err) {
    console.error('Profil olishda xatolik:', err);
    res.redirect('/');
  }
};

// Profilni yangilash
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, bio, card_number, avatar_url } = req.body;

    await pool.query(
      `UPDATE users SET name = $1, phone = $2, bio = $3, card_number = $4, avatar_url = $5 WHERE id = $6`,
      [
        name,
        phone,
        bio,
        card_number,
        avatar_url || 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/user.svg',
        userId
      ]
    );

    res.redirect('/profile');
  } catch (err) {
    console.error('Profil yangilashda xatolik:', err);
    res.redirect('/profile');
  }
};

// Sotuvchilikka ariza yuborish
exports.applyDesigner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { portfolio_url, experience_level } = req.body;

    await pool.query(
      `INSERT INTO designer_requests (user_id, portfolio_url, experience_level) VALUES ($1, $2, $3)`,
      [userId, portfolio_url, experience_level]
    );

    res.redirect('/profile');
  } catch (err) {
    console.error('Ariza yuborishda xatolik:', err);
    res.redirect('/profile');
  }
};
