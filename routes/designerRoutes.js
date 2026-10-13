const express = require('express');
const router = express.Router();
const designerController = require('../controllers/designerController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { isDesigner } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Barcha yo'nalishlar uchun login va designer roli talab etiladi
router.use(isAuthenticated, isDesigner);

// Dizayner statistikasi va paneli
router.get('/dashboard', designerController.getDashboard);

// Yangi SVG yuklash sahifasi va fayl qabul qilish
router.get('/upload', designerController.getUploadPage);
router.post('/upload', 
    upload.fields([
        { name: 'preview_svg', maxCount: 1 },
        { name: 'file_zip', maxCount: 1 }
    ]), 
    designerController.uploadProduct
);

// Mahsulotni o'chirish
router.delete('/product/:id', designerController.deleteProduct);

module.exports = router;