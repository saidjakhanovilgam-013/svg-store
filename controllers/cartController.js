const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');

module.exports = {
  // Savat sahifasi
  getCartPage: async (req, res) => {
    try {
      const cart = req.session.cart || [];
      const cartItems = await productModel.findByIds(cart);
      const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);

      res.render('cart/index', { title: 'Savatcha', cartItems, totalPrice });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // Savatga qo'shish (AJAX)
  addToCart: (req, res) => {
    const { productId } = req.body;
    if (!req.session.cart) {
      req.session.cart = [];
    }

    if (!req.session.cart.includes(parseInt(productId))) {
      req.session.cart.push(parseInt(productId));
    }

    res.json({ success: true, cartCount: req.session.cart.length });
  },

  // Savatdan o'chirish
  removeFromCart: (req, res) => {
    const productId = parseInt(req.params.id);
    if (req.session.cart) {
      req.session.cart = req.session.cart.filter(id => id !== productId);
    }
    res.json({ success: true });
  },

  // Checkout sahifasi
  getCheckoutPage: async (req, res) => {
    try {
      const cart = req.session.cart || [];
      const cartItems = await productModel.findByIds(cart);
      const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);

      res.render('cart/checkout', { title: 'To\'lov', cartItems, totalPrice });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server xatoligi");
    }
  },

  // To'lovni boshlash va order yaratish
  processPayment: async (req, res) => {
    try {
      const cart = req.session.cart || [];
      const cartItems = await productModel.findByIds(cart);
      const totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
      const { payment_provider } = req.body;

      const order = await orderModel.createOrder({
        buyer_id: req.user.id,
        total_amount: totalPrice,
        payment_provider,
        items: cartItems
      });

      // Savatni tozalaymiz
      req.session.cart = [];

      // Test rejimida darhol to'landi deb belgilaymiz (Production'da merchant checkout redirect bo'ladi)
      await orderModel.markAsPaid(order.id);

      res.redirect('/shop?success=true');
    } catch (err) {
      console.error(err);
      res.status(500).send("To'lovda xatolik");
    }
  },

  // Webhooklar (Payme / Click)
  paymeWebhook: (req, res) => {
    res.json({ result: { state: 2 } });
  },
  clickWebhook: (req, res) => {
    res.json({ error: 0, error_note: "Success" });
  }
};