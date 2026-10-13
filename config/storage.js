const path = require('path');
const fs = require('fs');

// Local xotira uchun papkalar mavjudligini tekshirish va yaratish
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storageConfig = {
  // Xotira turi: '.env' faylidagi STORAGE_TYPE ('local' yoki 's3')
  type: process.env.STORAGE_TYPE || 'local',

  // Local saqlash yo'llari
  local: {
    previewsDir: path.join(__dirname, '../public/uploads/previews'),
    filesDir: path.join(__dirname, '../public/uploads/files'),
    init: function() {
      ensureDirectoryExists(this.previewsDir);
      ensureDirectoryExists(this.filesDir);
      console.log('📁 Local yuklash papkalari tayyor qilindi.');
    }
  },

  // AWS S3 / Bulutli xotira sozlamalari (Kelajakda ulash uchun)
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_S3_BUCKET_NAME
  }
};

// Local papkalarni ishga tushirish
if (storageConfig.type === 'local') {
  storageConfig.local.init();
}

module.exports = storageConfig;