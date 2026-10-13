const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const profileRoutes = require('./routes/profileRoutes');
require('dotenv').config();

// Passport sozlamalarini yuklash
require('./config/passport');
require('./config/storage');

const app = express();

// 1. View Engine (EJS) va Public papka sozlamalari
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Body Parser va Middleware'lar
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretkey_svgstore',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 kun
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

// 7. Global Xatoliklarni ushlash middleware (Error handler)
app.use((err, req, res, next) => {
  console.error('❌ Server Xatoligi:', err.stack);
  res.status(500).send('Internal Server Error: Serverda texnik xatolik yuz berdi.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT}-portda muvaffaqiyatli ishga tushdi: http://localhost:${PORT}`);
});
