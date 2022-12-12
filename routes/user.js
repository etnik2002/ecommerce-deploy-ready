const router = require('express').Router();
const passport = require('passport');
const { kerkohetIdentifikimi, isAdmin, isCeo } = require('../middleware/auth');
const flash = require('connect-flash');
const User = require('../models/User');

const {
  getUsers,
  getRegister,
  postRegister,
  getLogin,
  getUserProfile,
  getUpdateUSer,
  getOrderedProduct,
  postUpdateUser,
  postDeleteUser,
  ceoManageAdmins,
  changeAdminRole,
  adminGetAllUsers,
  getResetPassword,
  postResetPassword,
} = require('../controllers/user-controller');

router.get('/', getUsers);

router.get('/register', getRegister);

router.post('/register', postRegister);

router.get('/login', getLogin);

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    successRedirect: '/?login=success',
    failureRedirect: '/users/login?succes=false',
  })
);

router.get('/profile', kerkohetIdentifikimi, getUserProfile);

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/users/login?logout=true');
  });
});

router.get('/ordered/:id', kerkohetIdentifikimi, getOrderedProduct);

router.get('/update/:id', getUpdateUSer);

router.post('/update/:id', postUpdateUser);

router.post('/delete/:id', postDeleteUser);

router.get('/allAdmins', async (req, res) => {
  const admins = await User.find({ userRole: 'admin' });
  res.render('users/allAdmins', { admins });
});

router.get('/ceo-manage/admins', ceoManageAdmins);

router.post('/ceo/change-user-role/:id', isCeo, changeAdminRole);

router.get('/all-users', isCeo, adminGetAllUsers);

router.get('/password-reset', getResetPassword);

router.post('/password-reset', postResetPassword);

router.get('/admin', async (req, res) => {
  const product = await Product.find({});
  const allOrders = await Order.find({}).sort({ createdAt: 'desc' }).limit(10);
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

    // console.log('Message sent: %s', info.messageId);

    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // client.messages
    //   .create({
    //     body: 'Your order has been confirmed!',
    //     to: orderEmail.customerPhone,
    //     from: '+13029243867',
    //   })
    //   .then((message) => console.log(message))
    //   .catch((error) => console.log(error));

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
        // text: req.user.username + ' ' + 'just placed a new order!',
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

module.exports = router;
