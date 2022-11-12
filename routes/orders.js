const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');

const {
  getAllOrders,
  postDeleteOrder,
} = require('../controllers/orders-controller');
const Order = require('../models/Order');

router.get('/', getAllOrders);

router.post('/delete/:id', postDeleteOrder);

router.get('/allOrders', isAdmin, async (req, res) => {
  const allOrders = await Order.find({}).sort({ createdAt: 'desc' });
  res.render('orders/allOrders', { allOrders });
});

module.exports = router;
