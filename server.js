const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
//import routes
const Product = require('./models/Product');
const { getSingleCatProducts } = require('./controllers/categories-controller');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.js');
const productsRoutes = require('./routes/product.js');
const cartRoutes = require('./routes/cart.js');
const orderRoutes = require('./routes/orders.js');
const categoriesRoutes = require('./routes/categories.js');
// const PORT = 8081;
const { assign } = require('nodemailer/lib/shared');

const lidhuMeDatabase = require('./database');
const User = require('./models/User');
const Categories = require('./models/Categories');
const Order = require('./models/Order');
const { ceoManageAdmins } = require('./controllers/user-controller');

const STRIPE_TEST_PUBLISHABLE_KEY =
  'pk_test_51K1DdaDAZApOs2EVXCiMmQnlAa9TIqCpnuhrDrpiKqdTGuGlNvbbyYnaEPgl2m0Qg2WfBC6r6j2wfP2jLdDwPdnm00D2bcqz6v';
const STRIPE_TEST_SECRET_KEY =
  'sk_test_51K1DdaDAZApOs2EV0Ig7LD6s4lAqAHm3tk9j3SKl5yhKqbDkm8xsUXgpJZ0PL8s0eXm7MK7dBM7ojhHmn0f3BosX00ICXrXpbV';

const stripe = require('stripe')(STRIPE_TEST_SECRET_KEY);

const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', // or 'live'
  client_id:
    'AVDn0zM75RGU80cgKLF3P9vmkT7t3cc_N2k5u-pzfBCPWVDYlwF7c2sK_TIQkf5vhBBg7yD1-7E4avAf',
  client_secret:
    'EIzs4sPcr3kHJPhrJ_hLuKvePQIbct-Onmniz3abrU15ZXqB2XDKD0kP5FXYRbwzj19Hfokl8pJVft3s',
});

// require('./middleware/google-auth');
lidhuMeDatabase();

app.use(express.static('public'));
// app.use(express.urlencoded({ extended: false }));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
// require('./middleware/google-auth');
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
const porttttt = process.env.PORT;
console.log({ porttttt });
app.use(passport.initialize());
app.use(passport.session());

//use routes
app.use('/users', userRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoriesRoutes);
app.use(cookieParser());
// middlewares
app.use(express.static(__dirname + '/public'));
app.get('/public', express.static('public'));
//render files html / pug
app.engine('pug', require('pug').__express);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
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

app.get('/error', (req, res) => {
  res.render('errors/404');
});

app.get('/discounts', async (req, res) => {
  const productsWithDiscount = await Product.find({ discount: { $gt: 0 } });

  console.log({ productsWithDiscount });
  res.render('products/withDiscount', { productsWithDiscount });
});

app.get('/orders/unconfirmed', async (req, res) => {
  const unconfirmedOrders = await Order.find({ status: false });
  console.log({ unconfirmedOrders: unconfirmedOrders.length });

  res.render('orders/unconfirmed', { unconfirmedOrders });
});

app.get('/orders/confirmed', async (req, res) => {
  const confirmedOrders = await Order.find({ status: true });

  console.log({ confirmedOrders: confirmedOrders.length });

  res.render('orders/confirmed', { confirmedOrders });
});

app.get(`/:id`, getSingleCatProducts);

app.use(flash());

const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`server listening at http://localhost:${PORT}`);
});
