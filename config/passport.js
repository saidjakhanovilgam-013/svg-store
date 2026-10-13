const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

// 1. LOCAL STRATEGY (Email va Parol orqali kirish)
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await userModel.findByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Email yoki parol xato!' });
        }

        // Parol yo'q bo'lsa (Google orqali ro'yxatdan o'tgan bo'lishi mumkin)
        if (!user.password_hash) {
          return done(null, false, { message: 'Iltimos, Google orqali kiring!' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
          return done(null, false, { message: 'Email yoki parol xato!' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 2. GOOGLE OAUTH2 STRATEGY (Google orqali kirish)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;

        // 1. Google ID orqali qidirish
        let user = await userModel.findByGoogleId(googleId);

        if (!user) {
          // 2. Email orqali qidirish
          user = await userModel.findByEmail(email);

          if (user) {
            // Mavjud foydalanuvchiga google_id biriktiramiz
            await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
          } else {
            // Yangi foydalanuvchi yaratamiz
            user = await userModel.create({
              name: profile.displayName,
              email: email,
              password_hash: null,
              google_id: googleId,
              role: 'buyer'
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Session sozlamalari (Foydalanuvchi ID sini sessiyada saqlash va tiklash)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;