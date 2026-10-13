const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

module.exports = {
  // Register sahifasi
  getRegisterPage: (req, res) => {
    res.render('auth/register', { title: "Ro'yxatdan o'tish" });
  },

  // Ro'yxatdan o'tish amali
  registerUser: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.render('auth/register', { 
          title: "Ro'yxatdan o'tish", 
          error_msg: "Ushbu email allaqachon ro'yxatdan o'tgan!" 
        });
      }

      // Parolni xeshlaymiz
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      await userModel.create({ name, email, password_hash });
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('auth/register', { title: "Ro'yxatdan o'tish", error_msg: "Texnik xatolik yuz berdi!" });
    }
  },

  // Login sahifasi
  getLoginPage: (req, res) => {
    res.render('auth/login', { title: "Tizimga kirish" });
  },

  // Login amali
  loginUser: async (req, res, next) => {
    // Passport strategy orqali login qilinadi
    const passport = require('passport');
    passport.authenticate('local', {
      successRedirect: '/shop',
      failureRedirect: '/auth/login',
      failureFlash: false
    })(req, res, next);
  },

  // Google Callback
  googleCallback: (req, res) => {
    res.redirect('/shop');
  },

  // Tizimdan chiqish
  logoutUser: (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/auth/login');
    });
  }
};