const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');

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
        return res.status(404).render('admin_dashboard', { message: 'Mahsulot topilmadi!' });
      }

      // Ko'rishlar sonini oshiramiz
      await productModel.incrementViews(productId);

      res.render('shop/detail', { title: product.title, product });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  }
};