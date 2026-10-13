const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Ro'yxatdan o'tish
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.registerUser);

// Tizimga kirish
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginUser);

// Tizimdan chiqish
router.get('/logout', authController.logoutUser);

// Google OAuth2
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/login' }),
    authController.googleCallback
);

module.exports = router;