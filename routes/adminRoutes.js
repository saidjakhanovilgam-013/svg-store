const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Barcha yo'nalishlar uchun login va admin roli talab etiladi
router.use(isAuthenticated, isAdmin);

// Admin paneli asosiy sahifasi
router.get('/dashboard', adminController.getDashboard);

// SVG fayllarni moderatsiya qilish (Shablonlarga moslangan marshrutlar)
router.post('/product/:id/approve', adminController.approveProduct);
router.post('/product/:id/reject', adminController.rejectProduct);

// Muqobil eskicha marshrutlar (Xavfsizlik uchun qoldirildi)
router.post('/approve-product/:id', adminController.approveProduct);
router.post('/reject-product/:id', adminController.rejectProduct);

// Dizaynerlik arizalari ro'yxati va tasdiqlash
router.get('/requests', adminController.getDesignerRequests);
router.post('/request/:id/approve', adminController.approveDesigner);
router.post('/request/:id/reject', adminController.rejectDesigner);
router.post('/approve-designer/:id', adminController.approveDesigner);

module.exports = router;
