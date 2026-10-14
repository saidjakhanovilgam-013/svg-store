const path = require('path');
const fs = require('fs');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const pool = require('../config/db');

module.exports = {
  // Bosh sahifa
  getHomePage: async (req, res) => {
    try {
      const products = await productModel.getAllApproved({});
      res.render('shop/index', { title: 'SVG Store - Bosh sahifa', products: products.slice(0, 8) });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Katalog (Filtrlar va Qidiruv)
  getCatalogPage: async (req, res) => {
    try {
      const { category, min_price, max_price, q } = req.query;
      const categories = await categoryModel.getAll();
      const products = await productModel.getAllApproved({
        category,
        min_price,
        max_price,
        search: q
      });

      res.render('shop/catalog', {
        title: 'SVG Katalog',
        products,
        categories,
        selectedCategory: category,
        minPrice: min_price,
        maxPrice: max_price
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Bitta SVG haqida batafsil sahifa
  getProductDetailPage: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await productModel.findById(productId);

      if (!product || product.status !== 'approved') {
        return res.status(404).send('Mahsulot topilmadi!');
      }

      // Ko'rishlar sonini oshiramiz
      await productModel.incrementViews(productId);

      // Foydalanuvchi ushbu mahsulotni sotib olganmi?
      let hasPurchased = false;
      if (req.user) {
        if (req.user.role === 'admin' || product.designer_id === req.user.id) {
          hasPurchased = true;
        } else {
          const purchaseCheck = await pool.query(
            `SELECT oi.id FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.buyer_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'`,
            [req.user.id, productId]
          );
          hasPurchased = purchaseCheck.rows.length > 0;
        }
      }

      res.render('shop/detail', { title: product.title, product, hasPurchased });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Himoyalangan yuklab olish (Faqat sotib olgan xaridor yoki dizayner uchun)
  downloadProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = req.user.id;

      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).send("Mahsulot topilmadi!");
      }

      // Huquqni tekshirish
      const isOwner = (product.designer_id === userId) || (req.user.role === 'admin');
      const purchaseCheck = await pool.query(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.buyer_id = $1 AND oi.product_id = $2 AND o.payment_status = 'paid'`,
        [userId, productId]
      );
      const isPurchased = purchaseCheck.rows.length > 0;

      if (!isOwner && !isPurchased) {
        return res.status(403).send("Kechirasiz, ushbu faylni yuklab olish uchun avval uni sotib olishingiz kerak!");
      }

      // Yuklab olishlar sonini bittaga oshirish
      await pool.query('UPDATE products SET downloads_count = downloads_count + 1 WHERE id = $1', [productId]);

      const filePath = product.file_zip_path;

      // Agar havola bo'lsa (URL)
      if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
        return res.redirect(filePath);
      }

      // Agar lokal fayl bo'lsa
      if (filePath) {
        const absolutePath = path.join(__dirname, '../public', filePath);
        if (fs.existsSync(absolutePath)) {
          const cleanName = product.title.replace(/[^a-zA-Z0-9_-]/g, '_');
          return res.download(absolutePath, `${cleanName}.zip`);
        }
      }

      // Agar ZIP fayl mavjud bo'lmasa, prevyu SVG manzilini taqdim etamiz
      if (product.preview_svg_path && (product.preview_svg_path.startsWith('http://') || product.preview_svg_path.startsWith('https://'))) {
        return res.redirect(product.preview_svg_path);
      }

      res.status(404).send("Kechirasiz, yuklab olish uchun fayl mavjud emas!");
    } catch (err) {
      console.error("Yuklab olishda xatolik:", err);
      res.status(500).send("Yuklab olishda server xatoligi yuz berdi");
    }
  }
};