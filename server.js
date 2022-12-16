const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
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
const generalRoutes = require('./routes/general.js');
const PORT = 8081;
const lidhuMeDatabase = require('./database');
const User = require('./models/User');
const Categories = require('./models/Categories');
const Order = require('./models/Order');

const STRIPE_TEST_PUBLISHABLE_KEY =
  'pk_test_51K1DdaDAZApOs2EVXCiMmQnlAa9TIqCpnuhrDrpiKqdTGuGlNvbbyYnaEPgl2m0Qg2WfBC6r6j2wfP2jLdDwPdnm00D2bcqz6v';
const STRIPE_TEST_SECRET_KEY =
  'sk_test_51K1DdaDAZApOs2EV0Ig7LD6s4lAqAHm3tk9j3SKl5yhKqbDkm8xsUXgpJZ0PL8s0eXm7MK7dBM7ojhHmn0f3BosX00ICXrXpbV';

const stripe = require('stripe')(STRIPE_TEST_SECRET_KEY);

// require('./middleware/google-auth');
lidhuMeDatabase();

app.use(express.static('public'));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
require('./middleware/passport')(passport);
app.use(require('connect-flash')());

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
app.use('/', generalRoutes);
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.get('/public', express.static('public'));

app.engine('pug', require('pug').__express);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/error', (req, res) => {
  res.render('errors/404');
});

app.get(`/:id`, getSingleCatProducts);

app.use(flash());

app.listen(3000, () => {
  console.log(`server listening at http://localhost:${3000}`);
});
