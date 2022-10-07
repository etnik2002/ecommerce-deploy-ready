const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');

const {
  getAllOrders,
  unconfirmedOrders,
} = require('../controllers/orders-controller');

router.get('/', getAllOrders);

module.exports = router;
