const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Savatchani ko'rish
router.get('/', cartController.getCartPage);

// Savatga mahsulot qo'shish (AJAX)
router.post('/add', cartController.addToCart);

// Savatdan mahsulotni o'chirish
router.delete('/remove/:id', cartController.removeFromCart);

// Checkout (To'lov sahifasi)
router.get('/checkout', isAuthenticated, cartController.getCheckoutPage);

// To'lovni amalga oshirish va Webhooklar
router.post('/process-payment', isAuthenticated, cartController.processPayment);
router.post('/webhook/payme', cartController.paymeWebhook);
router.post('/webhook/click', cartController.clickWebhook);

module.exports = router;