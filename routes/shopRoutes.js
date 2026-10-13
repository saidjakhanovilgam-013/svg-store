const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

// Bosh sahifa
router.get('/', shopController.getHomePage);

// Katalog (Qidiruv va Filtrlar)
router.get('/shop', shopController.getCatalogPage);

// Bitta mahsulotning batafsil sahifasi
router.get('/shop/product/:id', shopController.getProductDetailPage);

module.exports = router;