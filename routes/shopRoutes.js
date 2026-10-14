const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

const { isAuthenticated } = require('../middlewares/authMiddleware');

// Bosh sahifa
router.get('/', shopController.getHomePage);

// Katalog (Qidiruv va Filtrlar)
router.get('/shop', shopController.getCatalogPage);

// Bitta mahsulotning batafsil sahifasi
router.get('/shop/product/:id', shopController.getProductDetailPage);

// Sotib olingan mahsulotni yuklab olish
router.get('/shop/download/:id', isAuthenticated, shopController.downloadProduct);

module.exports = router;