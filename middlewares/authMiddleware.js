module.exports = {
  // Foydalanuvchi tizimga kirganmi?
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    // Agar kirmagan bo'lsa, login sahifasiga yo'naltiriladi
    res.redirect('/auth/login');
  },

  // Agar allaqachon tizimga kirgan bo'lsa, qayta login/register sahifasiga kiritmaslik
  isGuest: (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return next();
    }
    res.redirect('/shop');
  }
};