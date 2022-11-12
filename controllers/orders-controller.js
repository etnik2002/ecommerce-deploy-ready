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

  postDeleteOrder: async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      const deletedOrder = await Order.deleteOne(order);
      console.log(deletedOrder);
      res.redirect('/admin?order-deleted=true');
    } catch (error) {
      console.log(error);
      res.redirect('/admin?order-deleted=false');
    }
  },
};
