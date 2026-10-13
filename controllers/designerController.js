const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');

module.exports = {
  // Dizayner paneli
  getDashboard: async (req, res) => {
    try {
      const products = await productModel.getByDesignerId(req.user.id) || [];
      const stats = await orderModel.getDesignerStats(req.user.id) || {};

      // Dashboard shabloni uchun statistikani hisoblash
      let totalViews = 0;
      let totalSales = 0;
      let totalEarnings = 0;

      products.forEach(item => {
        totalViews += parseInt(item.views_count || 0);
        totalSales += parseInt(item.sales_count || item.sales || 0);
        totalEarnings += parseInt(item.sales_count || item.sales || 0) * parseFloat(item.price || 0);
      });

      const categories = await categoryModel.getAll();

      res.render('designer/dashboard', {
        title: 'Dizayner Analitika Paneli',
        user: req.user,
        products,
        categories,
        stats,
        totalViews,
        totalSales,
        totalEarnings
      });
    } catch (err) {
      console.error('Dizayner dashboardida xatolik:', err);
      res.status(500).send("Serverda xatolik yuz berdi");
    }
  },

  // Upload sahifasi
  getUploadPage: async (req, res) => {
    try {
      const categories = await categoryModel.getAll();
      res.render('designer/upload', { title: 'Yangi SVG Yuklash', categories });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Fayllarni yuklash amali
  uploadProduct: async (req, res) => {
    try {
      const { title, category_id, price, description } = req.body;
      const previewFile = req.files['preview_svg'][0];
      const zipFile = req.files['file_zip'][0];

      const preview_svg_path = '/uploads/previews/' + previewFile.filename;
      const file_zip_path = '/uploads/files/' + zipFile.filename;

      await productModel.create({
        designer_id: req.user.id,
        category_id,
        title,
        description,
        price,
        preview_svg_path,
        file_zip_path
      });

      res.redirect('/designer/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send("Fayl yuklashda xatolik yuz berdi!");
    }
  },

  // Mahsulotni o'chirish
  deleteProduct: async (req, res) => {
    try {
      if (productModel.delete) {
        await productModel.delete(req.params.id, req.user.id);
      }
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
