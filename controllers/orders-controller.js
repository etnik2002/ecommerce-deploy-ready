const Order = require('../models/Order');
const User = require('../models/User');

module.exports = {
  getAllOrders: async (req, res) => {
    // const users = await User.countDocuments();
    const users = User.find({ orders: { $all: [{ orders: order }] } }).pretty();
    console.log({ users });
    res.render('orders', { users });
  },

  getUnconfirmedOrders: async (req, res) => {
    const unconfirmedOrders = await Order.find({ status: false });
    console.log({ unconfirmedOrders: unconfirmedOrders.length });
  },
};
