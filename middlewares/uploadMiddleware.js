const multer = require('multer');
const path = require('path');

// Fayllarni xotirada (Buffer) ushlash (Serverless va Cloud xotira uchun ideal)
const storage = multer.memoryStorage();

// Fayl formatlarini filtrlash va xavfsizlik
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'preview_svg') {
    // Prevyu faqat SVG formatida bo'lishi kerak
    if (file.mimetype === 'image/svg+xml' || file.originalname.endsWith('.svg')) {
      cb(null, true);
    } else {
      cb(new Error('Prevyu fayli faqat .SVG formatida bo\'lishi shart!'), false);
    }
  } else if (file.fieldname === 'file_zip') {
    // Asl fayl ZIP arxiv bo'lishi kerak
    if (
      file.mimetype === 'application/zip' || 
      file.mimetype === 'application/x-zip-compressed' || 
      file.originalname.endsWith('.zip')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Asl fayl faqat .ZIP arxiv formatida bo\'lishi shart!'), false);
    }
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // Maksimal hajmi 15MB
  }
});

module.exports = upload;