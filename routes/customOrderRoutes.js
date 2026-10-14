const express = require('express');
const router = express.Router();
const customOrderController = require('../controllers/customOrderController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { isBuyer, isDesigner } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Barcha amallar uchun tizimga kirgan bo'lish shart
router.use(isAuthenticated);

// Yangi buyurtma yaratish sahifasi va yuborish
router.get('/new/:designerId', customOrderController.getCreatePage);
router.post('/create', upload.single('reference_file'), customOrderController.createOrder);

// Mijozning buyurtmalari
router.get('/my-orders', isBuyer, customOrderController.getMyOrders);

// Dizaynerga kelib tushgan buyurtmalar
router.get('/designer-orders', isDesigner, customOrderController.getDesignerOrders);

// Bitta buyurtma batafsil sahifasi
router.get('/detail/:id', customOrderController.getOrderDetail);

// Dizayner amallari
router.post('/:id/accept', isDesigner, customOrderController.acceptOrder);
router.post('/:id/reject', isDesigner, customOrderController.rejectOrder);
router.post('/:id/submit', isDesigner, upload.single('deliverable_file'), customOrderController.submitWork);

// Mijoz amallari
router.post('/:id/pay', customOrderController.payOrder);
router.post('/:id/approve', customOrderController.approveOrder);
router.post('/:id/revision', customOrderController.requestRevision);

module.exports = router;
