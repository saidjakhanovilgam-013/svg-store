const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const pool = require('../config/db');

module.exports = {
  // Admin paneli
  getDashboard: async (req, res) => {
    try {
      // Moderatsiyadagi mahsulotlarni olish
      const pendingProducts = await productModel.getPendingProducts() || [];

      // Bazadan real statistikani hisoblash
      const usersCountRes = await pool.query("SELECT COUNT(*) FROM users");
      const designersCountRes = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'designer'");
      const productsCountRes = await pool.query("SELECT COUNT(*) FROM products");
      
      // Platforma tushumini hisoblash (so'mda)
      const revenueRes = await pool.query(`
        SELECT COALESCE(SUM(p.price), 0) as total 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id
      `);

      const stats = {
        usersCount: parseInt(usersCountRes.rows[0].count) || 0,
        designersCount: parseInt(designersCountRes.rows[0].count) || 0,
        productsCount: parseInt(productsCountRes.rows[0].count) || 0,
        totalRevenue: parseFloat(revenueRes.rows[0].total) || 0
      };

      res.render('admin/dashboard', {
        title: 'Admin Paneli',
        user: req.user,
        pendingProducts,
        stats
      });
    } catch (err) {
      console.error('Admin dashboardda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  },

  // SVG tasdiqlash
  approveProduct: async (req, res) => {
    try {
      await productModel.updateStatus(req.params.id, 'approved');
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Mahsulotni tasdiqlashda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  },

  // SVG rad etish
  rejectProduct: async (req, res) => {
    try {
      await productModel.updateStatus(req.params.id, 'rejected');
      res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('Mahsulotni rad etishda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Dizaynerlik arizalari sahifasi
  getDesignerRequests: async (req, res) => {
    try {
      const requests = await userModel.getPendingDesigners() || [];
      res.render('admin/requests', { 
        title: 'Dizaynerlik Arizalari', 
        user: req.user,
        requests 
      });
    } catch (err) {
      console.error('Arizalarni olishda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Foydalanuvchini dizayner qilish
  approveDesigner: async (req, res) => {
    try {
      await userModel.approveDesigner(req.params.id);
      res.redirect('/admin/requests');
    } catch (err) {
      console.error('Dizaynerni tasdiqlashda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Dizaynerlik arizasini rad etish
  rejectDesigner: async (req, res) => {
    try {
      await userModel.rejectDesigner(req.params.id);
      res.redirect('/admin/requests');
    } catch (err) {
      console.error('Arizani rad etishda xatolik:', err);
      res.status(500).send("Server xatoligi");
    }
  }
};
