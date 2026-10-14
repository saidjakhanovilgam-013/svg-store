const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./config/db');
const passport = require('passport');
const profileRoutes = require('./routes/profileRoutes');
require('dotenv').config();

// Passport sozlamalarini yuklash
require('./config/passport');
require('./config/storage');

const app = express();
app.set('trust proxy', 1);

// 1. View Engine (EJS) va Public papka sozlamalari
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Body Parser va Middleware'lar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Express Session (PostgreSQL bazasida doimiy saqlash)
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false
  }),
  secret: process.env.SESSION_SECRET || 'secretkey_svgstore',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
    secure: isProduction,
    sameSite: 'lax'
  }
}));

// 4. Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// 5. Global o'zgaruvchilar (EJS shablonlari uchun)
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.cartCount = req.session.cart ? req.session.cart.length : 0;
  next();
});

// 6. Routes (Yo'nalishlar)
app.use('/', require('./routes/shopRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/designer', require('./routes/designerRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/profile', profileRoutes);
app.use('/custom-orders', require('./routes/customOrderRoutes'));

// 7. Global Xatoliklarni ushlash middleware (Error handler)
app.use((err, req, res, next) => {
  console.error('❌ Server Xatoligi:', err.stack);
  res.status(500).send('Internal Server Error: Serverda texnik xatolik yuz berdi.');
});

const PORT = process.env.PORT || 3000;

// Faqat server Vercel-dan tashqarida (oddiy serverda) ishlayotgandagina listen bo'lishi kerak
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Eng oxirida Express app obyektini tashqariga eksport qilib qo'yish shart (Vercel o'qib olishi uchun)
module.exports = app;