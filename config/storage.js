const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'svg-store';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('⚠️ Supabase mijozini yaratishda xatolik:', err.message);
  }
}

// Local xotira uchun papkalar mavjudligini tekshirish va yaratish
const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.warn(`⚠️ Papka yaratilmadi (Vercel kabi read-only tizim): ${err.message}`);
  }
};

const storageConfig = {
  // Xotira turi: 'supabase' yoki 'local'
  type: process.env.STORAGE_TYPE || 'supabase',
  bucketName: supabaseBucket,

  isSupabaseConfigured: () => {
    return !!supabase;
  },

  // Supabase Storage-ga to'g'ridan-to'g'ri bufferdan yuklash (Serverless uchun ideal)
  uploadToSupabase: async (fileBuffer, originalName, folder = 'previews', mimeType = '') => {
    if (!supabase) {
      throw new Error('Supabase xizmati sozlanmagan!');
    }

    const ext = path.extname(originalName);
    const cleanBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${folder}/${Date.now()}_${cleanBaseName}${ext}`;

    const { data, error } = await supabase.storage
      .from(supabaseBucket)
      .upload(uniqueFileName, fileBuffer, {
        contentType: mimeType || undefined,
        upsert: true
      });

    if (error) {
      console.error('❌ Supabase upload xatosi:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from(supabaseBucket)
      .getPublicUrl(uniqueFileName);

    return publicUrlData.publicUrl;
  },

  // Local saqlash yo'llari (Zaxira uchun)
  local: {
    previewsDir: path.join(__dirname, '../public/uploads/previews'),
    filesDir: path.join(__dirname, '../public/uploads/files'),
    referencesDir: path.join(__dirname, '../public/uploads/references'),
    deliverablesDir: path.join(__dirname, '../public/uploads/deliverables'),
    init: function() {
      ensureDirectoryExists(this.previewsDir);
      ensureDirectoryExists(this.filesDir);
      ensureDirectoryExists(this.referencesDir);
      ensureDirectoryExists(this.deliverablesDir);
    }
  }
};

// Faqat local rejimda va no-production bo'lsa papkalarni ochamiz
if (storageConfig.type === 'local' && process.env.NODE_ENV !== 'production') {
  storageConfig.local.init();
}

module.exports = storageConfig;