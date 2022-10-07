const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
require('dotenv').config();
const bodyParser = require('body-parser');
//import routes
const Product = require('./models/Product');
const { getSingleCatProducts } = require('./controllers/categories-controller');
const flash = require('connect-flash');

const userRoutes = require('./routes/user.js');
const productsRoutes = require('./routes/product.js');
const cartRoutes = require('./routes/cart.js');
const orderRoutes = require('./routes/orders.js');
const categoriesRoutes = require('./routes/categories.js');
const PORT = 8081;

const lidhuMeDatabase = require('./database');
const User = require('./models/User');
const Categories = require('./models/Categories');
const Order = require('./models/Order');
lidhuMeDatabase();

app.use(express.static('public'));
// app.use(express.urlencoded({ extended: false }));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
require('./middleware/passport')(passport);
app.use(require('connect-flash')());

//database connection

app.use(
  session({
    secret: 'pulaTbardhaBmwMercedesZastava',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl:
        'mongodb+srv://etnik:Etnik002@cluster0.gcfqm8o.mongodb.net/?retryWrites=true&w=majority',
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

//use routes
app.use('/users', userRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoriesRoutes);
// middlewares
app.use(express.static(__dirname + '/public'));
app.get('/public', express.static('public'));
//render files html / pug
app.engine('pug', require('pug').__express);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
  const isFeatured = await Product.find({ isFeatured: true }).limit(4);
  const products = await Product.find({}).lean();
  const allProducts = products.length;
  const categories = await Categories.find({});

  res.render('index', {
    isFeatured,
    allProducts,
    categories,
    message: req.flash('success'),
  });
});

app.get('/orders/unconfirmed', async (req, res) => {
  const unconfirmedOrders = await Order.find({ status: false });
  console.log({ unconfirmedOrders: unconfirmedOrders.length });

  res.render('orders/unconfirmed', { unconfirmedOrders });
});

app.get('/admin', async (req, res) => {
  const product = await Product.find({});
  const allOrders = await Order.find({}).sort({ createdAt: 'desc' });
  const allProds = product.length;

  const totalOrders = await Order.find({});

  // const totalOrders = await Order.aggregate([
  //   {
  //     $group: {
  //       _id: null,
  //       total: {
  //         $sum: '$productPrice',
  //       },
  //     },
  //   },
  //   { $project: { _id: 0, total: 1 } },
  // ]);

  let total = 0;
  for (let i = 0; i < totalOrders.length; i++)
    total += totalOrders[i].productPrice;

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
      $lt: new Date().getTime(),
    },
  });

  let yesturdayOrders = await Order.find({
    createdAt: {
      $gte: new Date().getTime() - 24 * 60 * 60 * 1000 * 2,
      $lt: new Date().getTime() - 24 * 60 * 60 * 1000,
    },
  });

  let ordersThisWeek = await Order.find({
    createdAt: {
      $gte: new Date().getTime() - 24 * 60 * 60 * 1000 * 7,
      $lt: new Date().getTime(),
    },
  });

  let increase = (todayOrders.length / yesturdayOrders.length) * 100;

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

    total,
  });
});

app.post('/admin/:id', async (req, res) => {
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
        ` This is the product you ordered :  http://localhost:5000/products/${orderEmail.productID},
      if you have any questions feel free to contact the admin email.
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

    res.redirect('/admin?confirmed=true');
  } catch (error) {
    console.log(error);
    res.redirect('/admin?confirmed=false');
  }
}),
  app.post('/admin/unconfirm/:id', async (req, res) => {
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
          ` This is the product you ordered :  http://localhost:5000/products/${orderEmail.productID},
        For more details, do not hesitate to contact the admin email.
        Best regards!
        `,
      });

      res.redirect('/admin?unconfirmed=true');
    } catch (error) {
      console.log(error);
      res.redirect('/admin?unconfirmed=false');
    }
  });

app.get('/:id', getSingleCatProducts);

app.use(flash());

app.listen(PORT, (req, res) => {
  console.log(`server listening at http://localhost:${PORT}`);
});
