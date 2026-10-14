const pool = require('../config/db');

const customOrderModel = {
  // Yangi buyurtma taklifi yaratish
  create: async ({
    client_id,
    designer_id,
    service_type,
    title,
    description,
    requirements = '',
    budget,
    deadline_days = 3,
    format = 'Figma / SVG',
    reference_file_url = null
  }) => {
    const numBudget = parseFloat(budget);
    const platform_fee = (numBudget * 0.15).toFixed(2); // 15% platforma ulushi
    const designer_share = (numBudget * 0.85).toFixed(2); // 85% dizayner ulushi

    const res = await pool.query(
      `INSERT INTO custom_orders (
        client_id, designer_id, service_type, title, description,
        requirements, budget, deadline_days, format, reference_file_url,
        designer_share, platform_fee, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
      RETURNING *`,
      [
        client_id,
        designer_id,
        service_type,
        title,
        description,
        requirements,
        numBudget,
        deadline_days,
        format,
        reference_file_url,
        designer_share,
        platform_fee
      ]
    );
    return res.rows[0];
  },

  // ID orqali barcha tafsilotlari bilan olish
  findById: async (id) => {
    const res = await pool.query(
      `SELECT o.*,
              c.name as client_name, c.email as client_email, c.avatar_url as client_avatar, c.phone as client_phone,
              d.name as designer_name, d.email as designer_email, d.avatar_url as designer_avatar, d.phone as designer_phone
       FROM custom_orders o
       JOIN users c ON o.client_id = c.id
       JOIN users d ON o.designer_id = d.id
       WHERE o.id = $1`,
      [id]
    );
    return res.rows[0];
  },

  // Mijozning o'zi bergan buyurtmalar
  getByClientId: async (clientId) => {
    const res = await pool.query(
      `SELECT o.*, d.name as designer_name, d.email as designer_email, d.avatar_url as designer_avatar
       FROM custom_orders o
       JOIN users d ON o.designer_id = d.id
       WHERE o.client_id = $1
       ORDER BY o.created_at DESC`,
      [clientId]
    );
    return res.rows;
  },

  // Dizaynerga kelib tushgan buyurtmalar
  getByDesignerId: async (designerId) => {
    const res = await pool.query(
      `SELECT o.*, c.name as client_name, c.email as client_email, c.avatar_url as client_avatar
       FROM custom_orders o
       JOIN users c ON o.client_id = c.id
       WHERE o.designer_id = $1
       ORDER BY o.created_at DESC`,
      [designerId]
    );
    return res.rows;
  },

  // Dizayner buyurtmani qabul qilishi
  acceptOrder: async (id, designerId) => {
    const res = await pool.query(
      `UPDATE custom_orders
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND designer_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, designerId]
    );
    return res.rows[0] || null;
  },

  // Dizayner buyurtmani rad etishi
  rejectOrder: async (id, designerId) => {
    const res = await pool.query(
      `UPDATE custom_orders
       SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND designer_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, designerId]
    );
    return res.rows[0] || null;
  },

  // Sinov to'lovi tasdiqlanganda buyurtmani ish jarayoniga o'tkazish
  payOrder: async (id, clientId) => {
    const res = await pool.query(
      `UPDATE custom_orders
       SET is_paid = TRUE, status = 'in_progress', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND client_id = $2 AND status = 'accepted' AND is_paid = FALSE
       RETURNING *`,
      [id, clientId]
    );
    return res.rows[0] || null;
  },

  // Dizayner tayyor ishni topshirishi
  submitWork: async (id, designerId, submissionFileUrl, submissionNotes) => {
    const res = await pool.query(
      `UPDATE custom_orders
       SET submission_file_url = $1, submission_notes = $2, status = 'submitted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND designer_id = $4 AND status = 'in_progress' AND is_paid = TRUE
       RETURNING *`,
      [submissionFileUrl, submissionNotes, id, designerId]
    );
    return res.rows[0] || null;
  },

  // Mijoz ishni qabul qilib, yakunlashi (Mablag' dizayner balansiga o'tadi)
  approveAndComplete: async (id, clientId) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderRes = await client.query(
        `UPDATE custom_orders
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND client_id = $2 AND status = 'submitted' AND is_paid = TRUE
         RETURNING *`,
        [id, clientId]
      );

      const order = orderRes.rows[0];
      if (!order) {
        await client.query('ROLLBACK');
        return null;
      }

      // Dizayner balansini oshirish
      await client.query(
        `UPDATE users SET balance = COALESCE(balance, 0) + $1 WHERE id = $2`,
        [order.designer_share, order.designer_id]
      );

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Mijoz qayta ishlashga qaytarishi (Revision)
  requestRevision: async (id, clientId, revisionNotes) => {
    const res = await pool.query(
      `UPDATE custom_orders
       SET status = 'in_progress', submission_notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND client_id = $3 AND status = 'submitted' AND is_paid = TRUE
       RETURNING *`,
      [revisionNotes, id, clientId]
    );
    return res.rows[0] || null;
  }
};

module.exports = customOrderModel;
