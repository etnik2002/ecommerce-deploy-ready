const dotenv = require('dotenv');
dotenv.config();
const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Categories = require('../models/Categories');
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

router.post('/payment/:id', async (req, res) => {
  const user = await User.find({ _id: req.user.id });
  const product = await Product.findById(req.params.id);
  const price = product.prodPrice / 61.5;
  console.log({ product });
  console.log({ price }, ' EURO');

  stripe.customers
    .create({
      email: req.body.stripeEmail,
      source: req.body.stripeToken,
      name: req.user.username,
      userID: req.user._id,
      phone: req.user.phone,
      address: {
        line1: req.body.address,
        city: req.body.city,
        country: 'macedonia',
      },
    })

    .then((customer) => {
      return stripe.charges.create({
        amount: product.prodPrice,
        description: 'web dev product',
        currency: 'eur',
        customer: customer.id,
      });
    })
    .then((charge) => {
      console.log({ charge });
    })
    .catch((error) => {
      res.send(error);
    });

  const newOrder = new Order({
    customer: req.user._id,
    customerName: req.user.username,
    customerEmail: req.user.email,
    customerPhone: req.user.phone,
    customerAddress: req.body.address,
    customerCity: req.body.city,
    productID: req.params.id,
    productPrice: req.body.price,
    discount: req.body.discount,
    quantity: req.body.quantity,
    status: false,
  });

  const savedOrder = await newOrder
    .save()
    .then(console.log('true'))
    .catch('false');
  console.log({ savedOrder });

  const saveUser = await User.findOneAndUpdate(
    { _id: req.user.id },
    { $push: { orders: savedOrder.id } },
    { new: true }
  );

  await saveUser.save();

  const choonseQuantity = req.body.quantity;

  await Product.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { inStock: -choonseQuantity } }
  );

  await Product.findOneAndUpdate(
    { _id: req.params.id },
    { $inc: { sold: +choonseQuantity } }
  );

  if (product.inStock < 0) {
    product.inStock = 0;
  }

  res.redirect('/?stripe-payment-accepted&order-placed=true');
});

router.post('/admin/unconfirm/:id', async (req, res) => {
  const nodemailer = require('nodemailer');
  const orderEmail = await Order.findById(req.params.id);
  const user = await User.find({ _id: req.user.id });
  const product = await Product.findById(req.params.id);
  const admin = await User.find({ userRole: 'admin' });

  try {
    const unconfirmOrder = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: false } }
    );

    // setTimeout(async () => {
    await unconfirmOrder.delete();
    // }, 50000);

    req.flash('success', 'Order Successfully canceled and deleted');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      auth: {
        user: 'etnikz2002@gmail.com',
        pass: 'vysmnurlcmrzcwad',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: 'etnikz2002@gmail.com',
      to: orderEmail.customerEmail,
      subject: 'Order Status',
      html:
        `<h1>Hello ${orderEmail.customerName}, Your order has been canceled ↓ </h1>` +
        'Admin Email : ' +
        'etnikz2002@gmail.com' +
        ` This is the product you ordered :  http://localhost:8081/products/${orderEmail.productID},
        For more details, do not hesitate to contact the admin email.
        Best regards!
        `,
    });

    res.redirect('/admin?unconfirmed=true');
  } catch (error) {
    console.error(error);
    res.redirect('/error');
  }
});

router.get('/admin', async (req, res) => {
  const product = await Product.find({});
  const allOrders = await Order.find({}).sort({ createdAt: 'desc' }).limit(10);
  const totalOrdersPlaced = allOrders.length;
  const allProds = product.length;

  const totalOrders = await Order.find({ status: true });

  const totalOrdersPriceSum = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: '$productPrice',
        },
      },
    },
  ]);

  console.log({ totalOrdersPriceSum });

  let total = 0;
  let takenFromTotal = 0;
  let totalPrice = 0;
  for (let i = 0; i < totalOrders.length; i++) {
    total += totalOrders[i].productPrice * totalOrders[i].quantity;
    takenFromTotal +=
      (totalOrders[i].productPrice *
        totalOrders[i].quantity *
        totalOrders[i].discount) /
      100;

    totalPrice = total - takenFromTotal;
  }

  const unconfirmedOrders = await Order.find({ status: false });

  const order = await User.find({
    orders: {
      $size: 1,
    },
  }).populate('orders');

  const orders = order.length;

  const user = await User.findById({ _id: req.user.id });

  let todayOrders = await Order.find({
    createdAt: {
      $gte: new Date().getTime() - 24 * 60 * 60 * 1000,
      $lte: new Date().getTime(),
    },
  });

  let yesturdayOrders = await Order.find({
    createdAt: {
      $gte: new Date().getTime() - 24 * 60 * 60 * 1000 * 2,
      $lte: new Date().getTime() - 24 * 60 * 60 * 1000,
    },
  });

  let ordersThisWeek = await Order.find({
    createdAt: {
      $gte: new Date().getTime() - 24 * 60 * 60 * 1000 * 7,
      $lte: new Date().getTime(),
    },
  });

  let increase = (todayOrders.length / yesturdayOrders.length) * 100;

  const admins = await User.find({ userRole: 'admin' });
  const confirmedOrders = await Order.find({ status: true });

  res.render('adminPanel', {
    allProds,
    orders,
    allOrders,
    user,
    todayOrders,
    yesturdayOrders,
    ordersThisWeek,
    increase,
    unconfirmedOrders,
    confirmedOrders,
    admins,
    totalPrice,
    message: req.flash('success'),
  });
});

router.post('/admin/:id', async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    console.log(req.body, 'req body');
    console.log({ p: req.params.id });
    const orderEmail = await Order.findById(req.params.id);
    const user = await User.find({ _id: req.user.id });
    const product = await Product.findById(req.params.id);
    const admin = await User.find({ userRole: 'admin' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      auth: {
        user: 'etnikz2002@gmail.com',
        pass: 'vysmnurlcmrzcwad',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    let info = await transporter.sendMail({
      from: 'etnikz2002@gmail.com',
      to: orderEmail.customerEmail,
      subject: 'Order Status',
      // text: req.user.username + ' ' + 'just placed a new order!',
      html:
        `<h1>Hello ${orderEmail.customerName}, Your order has been confirmed ↓ </h1>` +
        'Admin Email : ' +
        'etnikz2002@gmail.com' +
        ` This is the product you ordered :  http://localhost:8081/products/${orderEmail.productID},
            Estimated time of arrival : ${req.body.eta} days.
            For any changes we will contact you in this email.
            If you have any questions feel free to contact the admin email.
        `,
    });

    const confirmedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: true } }
    );

    req.flash('success', 'Order confirmed successfully ');

    res.redirect('/admin?confirmed=true');
  } catch (error) {
    console.log(error);
    res.redirect('/error');
  }
}),
  router.get('/', async (req, res) => {
    const isFeatured = await Product.find({ isFeatured: true })
      .limit(3)
      .sort({ createdAt: 'desc' });
    const products = await Product.find({}).lean();
    const allProducts = products.length;
    const categories = await Categories.find({ active: true }).sort({
      createdAt: 'desc',
    });

    res.render('index', {
      isFeatured,
      allProducts,
      categories,
      message: req.flash('success'),
    });
  });

router.get('/discounts', async (req, res) => {
  const productsWithDiscount = await Product.find({ discount: { $gt: 0 } });

  console.log({ productsWithDiscount });
  res.render('products/withDiscount', { productsWithDiscount });
});

router.get('/orders/unconfirmed', async (req, res) => {
  const unconfirmedOrders = await Order.find({ status: false });
  console.log({ unconfirmedOrders: unconfirmedOrders.length });

  res.render('orders/unconfirmed', { unconfirmedOrders });
});

router.get('/orders/confirmed', async (req, res) => {
  const confirmedOrders = await Order.find({ status: true });

  console.log({ confirmedOrders: confirmedOrders.length });

  res.render('orders/confirmed', { confirmedOrders });
});

router.get('/error', (req, res) => {
  res.render('errors/404');
});

module.exports = router;
