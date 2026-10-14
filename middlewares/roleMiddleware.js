module.exports = {
  // Faqat Xaridorlar uchun
  isBuyer: (req, res, next) => {
    if (req.user && req.user.role === 'buyer') {
      return next();
    }
    res.status(403).send("Bu sahifaga faqat xaridorlar kira oladi.");
  },

  // Faqat Dizaynerlar uchun
  isDesigner: (req, res, next) => {
    if (req.user && req.user.role === 'designer') {
      return next();
    }
    res.status(403).render('admin_dashboard', { 
      message: 'Ushbu sahifaga kirish uchun sizda Dizayner maqomi bo\'lishi kerak!' 
    });
  },

  // Faqat Adminlar uchun
  isAdmin: (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    res.status(403).render('admin_dashboard', { 
      message: 'Ushbu sahifaga faqat platforma adminlari kira oladi!' 
    });
  }
};