const pool = require('../config/db');

const orderModel = {
  // Buyurtma yaratish
  createOrder: async ({ buyer_id, total_amount, payment_provider, items }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Orders jadvaliga qo'shish
      const orderRes = await client.query(
        `INSERT INTO orders (buyer_id, total_amount, payment_provider, payment_status)
         VALUES ($1, $2, $3, 'pending') RETURNING *`,
        [buyer_id, total_amount, payment_provider]
      );
      const order = orderRes.rows[0];

      // 2. Order items qo'shish (80% dizaynerga, 20% platformaga)
      for (const item of items) {
        const designerShare = (parseFloat(item.price) * 0.80).toFixed(2);
        await client.query(
          `INSERT INTO order_items (order_id, product_id, price, designer_share)
           VALUES ($1, $2, $3, $4)`,
          [order.id, item.id, item.price, designerShare]
        );
      }

      await client.query('COMMIT');
      return order;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // To'lov muvaffaqiyatli bo'lganda statusni o'zgartirish
  markAsPaid: async (orderId) => {
    const res = await pool.query(
      `UPDATE orders SET payment_status = 'paid' WHERE id = $1 RETURNING *`,
      [orderId]
    );
    return res.rows[0];
  },

  // Dizayner statistikasi (Jami tushum va sotuvlar)
  getDesignerStats: async (designerId) => {
    const res = await pool.query(
      `SELECT 
        COALESCE(SUM(oi.designer_share), 0) as total_earnings,
        COUNT(oi.id) as total_sales
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE p.designer_id = $1 AND o.payment_status = 'paid'`,
      [designerId]
    );
    return res.rows[0];
  }
};

module.exports = orderModel;