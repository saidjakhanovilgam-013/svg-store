const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.use(isAuthenticated);

// Profil sahifasi
router.get('/', profileController.getProfile);

// Profil ma'lumotlarini yangilash
router.post('/update', profileController.updateProfile);

// Sotuvchi bo'lish uchun ariza yuborish
router.post('/apply-designer', profileController.applyDesigner);

module.exports = router;
