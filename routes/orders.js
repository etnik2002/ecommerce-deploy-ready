const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');

const {
  getAllOrders,
  postDeleteOrder,
  getOrdersFromYear2023,
  getOrdersFromYear2022,
  getEarnings2023,
  getEarnings2022,
  getLastMonthEarnings,
} = require('../controllers/orders-controller');
const Order = require('../models/Order');
const Product = require('../models/Product');

router.get('/', getAllOrders);

router.post('/delete/:id', postDeleteOrder);

router.get('/unconfirmed', async (req, res) => {
  const unconfirmedOrders = await Order.find({ status: false });
  console.log({ unconfirmedOrders: unconfirmedOrders.length });

  res.render('orders/unconfirmed', { unconfirmedOrders });
});

router.get('/confirmed', async (req, res) => {
  const confirmedOrders = await Order.find({ status: true });

  console.log({ confirmedOrders: confirmedOrders.length });

  res.render('orders/confirmed', { confirmedOrders });
});

router.get('/allOrders', isAdmin, async (req, res) => {
  const allOrders = await Order.find({}).sort({ createdAt: 'desc' });
  res.render('orders/allOrders', { allOrders });
});

router.get('/orders2023', getOrdersFromYear2023);

router.get('/orders2022', getOrdersFromYear2022);

router.get('/earnings2022', getEarnings2022);

router.get('/earnings2023', getEarnings2023);

router.get('/last-month-earnings', getLastMonthEarnings);

module.exports = router;
