const fs = require('fs');
const path = require('path');
const customOrderModel = require('../models/customOrderModel');
const userModel = require('../models/userModel');
const storageConfig = require('../config/storage');

const serviceTypes = new Set(['presentation', 'figma_uiux', 'illustration']);
const formats = new Set([
  'Figma link',
  'PowerPoint / PDF (.pptx, .pdf)',
  'Vektor SVG / AI (.svg, .ai)',
  "ZIP to'plam (.zip)"
]);
const deadlines = new Set([1, 3, 5, 7, 14]);

const saveOrderFile = async (file, folder) => {
  if (storageConfig.isSupabaseConfigured()) {
    return storageConfig.uploadToSupabase(
      file.buffer,
      file.originalname,
      folder,
      file.mimetype
    );
  }

  if (storageConfig.type !== 'local') {
    throw new Error('Fayl saqlash xizmati sozlanmagan.');
  }

  const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileName = `${suffix}${path.extname(file.originalname).toLowerCase()}`;
  const directory = storageConfig.local[`${folder}Dir`];
  fs.writeFileSync(path.join(directory, fileName), file.buffer);
  return `/uploads/${folder}/${fileName}`;
};

const rejectInvalidAction = (res) => res.status(409).send(
  "Buyurtma topilmadi yoki bu amal uning joriy holatida bajarilishi mumkin emas."
);

module.exports = {
  // Yangi buyurtma berish sahifasi
  getCreatePage: async (req, res) => {
    try {
      const designerId = Number(req.params.designerId);
      if (!Number.isSafeInteger(designerId) || designerId <= 0) {
        return res.status(404).send("Dizayner topilmadi!");
      }

      const designer = await userModel.findById(designerId);

      if (!designer || designer.role !== 'designer' || !designer.is_approved_designer) {
        return res.status(404).send("Dizayner topilmadi!");
      }

      if (designer.id === req.user.id) {
        return res.status(400).send("O'zingizga buyurtma bera olmaysiz.");
      }

      res.render('custom_orders/create', {
        title: `${designer.name} ga buyurtma berish`,
        designer,
        user: req.user
      });
    } catch (err) {
      console.error('Buyurtma sahifasini ochishda xatolik:', err);
      res.status(500).send("Server xatoligi yuz berdi");
    }
  },

  // Buyurtma yaratish amali
  createOrder: async (req, res) => {
    try {
      const {
        designer_id,
        service_type,
        title,
        description,
        requirements,
        budget,
        deadline_days,
        format
      } = req.body;

      const designerId = Number(designer_id);
      const parsedBudget = Number(budget);
      const deadlineDays = Number(deadline_days);
      const cleanTitle = typeof title === 'string' ? title.trim() : '';
      const cleanDescription = typeof description === 'string' ? description.trim() : '';

      if (
        !Number.isSafeInteger(designerId) ||
        designerId <= 0 ||
        !serviceTypes.has(service_type) ||
        !cleanTitle ||
        cleanTitle.length > 200 ||
        !cleanDescription ||
        cleanDescription.length > 10000 ||
        !Number.isFinite(parsedBudget) ||
        parsedBudget < 50000 ||
        parsedBudget > 9999999999.99 ||
        !deadlines.has(deadlineDays) ||
        !formats.has(format)
      ) {
        return res.status(400).send("Buyurtma ma'lumotlari noto'g'ri yoki to'liq emas.");
      }

      const designer = await userModel.findById(designerId);
      if (!designer || designer.role !== 'designer' || !designer.is_approved_designer) {
        return res.status(400).send("Tanlangan foydalanuvchi tasdiqlangan dizayner emas.");
      }

      if (designer.id === req.user.id) {
        return res.status(400).send("O'zingizga buyurtma bera olmaysiz.");
      }

      let reference_file_url = null;

      // Agar mijoz namuna fayl yuklagan bo'lsa
      if (req.file) {
        reference_file_url = await saveOrderFile(req.file, 'references');
      }

      const order = await customOrderModel.create({
        client_id: req.user.id,
        designer_id: designerId,
        service_type,
        title: cleanTitle,
        description: cleanDescription,
        requirements: typeof requirements === 'string' ? requirements.trim() : '',
        budget: parsedBudget,
        deadline_days: deadlineDays,
        format,
        reference_file_url
      });

      res.redirect(`/custom-orders/detail/${order.id}`);
    } catch (err) {
      console.error('Buyurtma yaratishda xatolik:', err);
      res.status(500).send("Buyurtma yaratishda xatolik: " + err.message);
    }
  },

  // Mijozning shaxsiy buyurtmalari
  getMyOrders: async (req, res) => {
    try {
      const orders = await customOrderModel.getByClientId(req.user.id);
      res.render('custom_orders/index', {
        title: 'Mening Buyurtmalarim',
        orders,
        user: req.user
      });
    } catch (err) {
      console.error('Buyurtmalarni olishda xatolik:', err);
      res.status(500).send("Server xatoligi yuz berdi");
    }
  },

  // Dizaynerga kelib tushgan buyurtmalar
  getDesignerOrders: async (req, res) => {
    try {
      const orders = await customOrderModel.getByDesignerId(req.user.id);
      res.render('custom_orders/designer_orders', {
        title: 'Kelib tushgan buyurtmalar',
        orders,
        user: req.user
      });
    } catch (err) {
      console.error('Dizayner buyurtmalarini olishda xatolik:', err);
      res.status(500).send("Server xatoligi yuz berdi");
    }
  },

  // Buyurtma tafsilotlari sahifasi
  getOrderDetail: async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await customOrderModel.findById(orderId);

      if (!order) {
        return res.status(404).send("Buyurtma topilmadi!");
      }

      // Xavfsizlik: Faqat buyurtma egasi, ijrochi dizayner yoki admin ko'ra oladi
      const isClient = req.user.id === order.client_id;
      const isDesigner = req.user.id === order.designer_id;
      const isAdmin = req.user.role === 'admin';

      if (!isClient && !isDesigner && !isAdmin) {
        return res.status(403).send("Ushbu buyurtmani ko'rishga huquqingiz yo'q!");
      }

      res.render('custom_orders/detail', {
        title: `Buyurtma #${order.id} - ${order.title}`,
        order,
        isClient,
        isDesigner,
        isAdmin,
        user: req.user
      });
    } catch (err) {
      console.error('Buyurtma tafsilotlarini olishda xatolik:', err);
      res.status(500).send("Server xatoligi yuz berdi");
    }
  },

  // Dizayner: Buyurtmani qabul qilish
  acceptOrder: async (req, res) => {
    try {
      const order = await customOrderModel.acceptOrder(req.params.id, req.user.id);
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${req.params.id}`);
    } catch (err) {
      console.error('Qabul qilishda xatolik:', err);
      res.status(500).send("Xatolik yuz berdi");
    }
  },

  // Dizayner: Buyurtmani rad etish
  rejectOrder: async (req, res) => {
    try {
      const order = await customOrderModel.rejectOrder(req.params.id, req.user.id);
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${req.params.id}`);
    } catch (err) {
      console.error('Rad etishda xatolik:', err);
      res.status(500).send("Xatolik yuz berdi");
    }
  },

  // Mijoz: sinov to'lovini tasdiqlash
  payOrder: async (req, res) => {
    try {
      const order = await customOrderModel.payOrder(req.params.id, req.user.id);
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${req.params.id}?paid=true`);
    } catch (err) {
      console.error('To\'lovda xatolik:', err);
      res.status(500).send("To'lovda xatolik yuz berdi");
    }
  },

  // Dizayner: Tayyor ishni topshirish
  submitWork: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { figma_url, submission_notes } = req.body;
      const cleanNotes = typeof submission_notes === 'string' ? submission_notes.trim() : '';

      let submission_file_url = '';

      if (req.file) {
        submission_file_url = await saveOrderFile(req.file, 'deliverables');
      } else if (typeof figma_url === 'string' && figma_url.trim()) {
        let url;
        try {
          url = new URL(figma_url.trim());
        } catch {
          return res.status(400).send("Yuborilgan havola noto'g'ri.");
        }

        if (!['http:', 'https:'].includes(url.protocol)) {
          return res.status(400).send("Havola http yoki https bilan boshlanishi kerak.");
        }
        submission_file_url = url.toString();
      }

      if (!submission_file_url || cleanNotes.length > 5000) {
        return res.status(400).send("Tayyor fayl yoki havolani kiriting; izoh 5000 belgidan oshmasin.");
      }

      const order = await customOrderModel.submitWork(
        orderId,
        req.user.id,
        submission_file_url,
        cleanNotes
      );
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${orderId}`);
    } catch (err) {
      console.error('Ishni topshirishda xatolik:', err);
      res.status(500).send("Ishni topshirishda xatolik yuz berdi");
    }
  },

  // Mijoz: Ishni qabul qilib, yakunlash (Dizaynerga 85% pul o'tadi)
  approveOrder: async (req, res) => {
    try {
      const order = await customOrderModel.approveAndComplete(req.params.id, req.user.id);
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${req.params.id}?completed=true`);
    } catch (err) {
      console.error('Tasdiqlashda xatolik:', err);
      res.status(500).send("Tasdiqlashda xatolik yuz berdi");
    }
  },

  // Mijoz: Qayta ishlashga qaytarish (Revision)
  requestRevision: async (req, res) => {
    try {
      const { revision_notes } = req.body;
      const cleanNotes = typeof revision_notes === 'string' ? revision_notes.trim() : '';
      if (!cleanNotes || cleanNotes.length > 5000) {
        return res.status(400).send("Qayta ishlash izohi 1–5000 belgi orasida bo'lishi kerak.");
      }

      const order = await customOrderModel.requestRevision(req.params.id, req.user.id, cleanNotes);
      if (!order) return rejectInvalidAction(res);
      res.redirect(`/custom-orders/detail/${req.params.id}`);
    } catch (err) {
      console.error('Qayta ishlashga yuborishda xatolik:', err);
      res.status(500).send("Xatolik yuz berdi");
    }
  }
};
