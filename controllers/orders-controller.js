const Order = require('../models/Order');
const Product = require('../models/Product');
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

  getOrdersFromYear2023: async (req, res) => {
    const product = await Product.find({});
    const allOrders = await Order.find({});
    const viti2022 = '2022-01-01T00:00:00.201+00:00';
    const viti2023 = '2023-01-01T00:00:00.201+00:00';
    const viti2024 = '2024-01-01T00:00:00.201+00:00';

    const all = await Order.find({
      createdAt: { $gte: viti2023, $lt: viti2024 },
    });

    res.status(200).json(all);
  },

  getOrdersFromYear2022: async (req, res) => {
    const product = await Product.find({});
    const allOrders = await Order.find({});
    const viti2022 = '2022-01-01T00:00:00.201+00:00';
    const viti2023 = '2023-01-01T00:00:00.201+00:00';
    const viti2024 = '2024-01-01T00:00:00.201+00:00';

    const all = await Order.find({
      createdAt: { $gte: viti2022, $lt: viti2023 },
    });

    res.status(200).json(all);
  },

  getEarnings2022: async (req, res) => {
    const viti2022 = '2022-01-01T00:00:00.201+00:00';
    const viti2023 = '2023-01-01T00:00:00.201+00:00';
    const viti2024 = '2024-01-01T00:00:00.201+00:00';

    const all = await Order.find({
      createdAt: { $gte: viti2022, $lt: viti2023 },
    });

    var ordersPrices = 0;
    for (let i = 0; i < all.length; i++) {
      if (isNaN(all[i].productPrice)) {
        continue;
      }
      ordersPrices += all[i].productPrice;
    }
    console.log({ ordersPrices });

    res.status(200).json(ordersPrices);
  },
  getEarnings2023: async (req, res) => {
    const viti2022 = '2022-01-01T00:00:00.201+00:00';
    const viti2023 = '2023-01-01T00:00:00.201+00:00';
    const viti2024 = '2024-01-01T00:00:00.201+00:00';

    const all = await Order.find({
      createdAt: { $gte: viti2023, $lt: viti2024 },
    });

    var ordersPrices = 0;
    for (let i = 0; i < all.length; i++) {
      if (isNaN(all[i].productPrice)) {
        continue;
      }
      ordersPrices += all[i].productPrice;
    }
    console.log({ ordersPrices });
    res.status(200).json(all);
  },

  getLastMonthEarnings: async (req, res) => {
    const all = await Order.find({
      createdAt: {
        $gte: new Date().getTime() - 24 * 60 * 60 * 1000 * 30,
        $lte: new Date().getTime(),
      },
    });

    var earningsLastMonth = 0;
    for (let i = 0; i < all.length; i++) {
      if (isNaN(all[i].productPrice)) {
        continue;
      }
      earningsLastMonth += all[i].productPrice;
    }
    console.log({ earningsLastMonth });

    res.status(200).json(earningsLastMonth);
  },
};
