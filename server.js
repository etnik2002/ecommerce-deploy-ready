const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
const bodyParser = require('body-parser');
const { getSingleCatProducts } = require('./controllers/categories-controller');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.js');
const productsRoutes = require('./routes/product.js');
const cartRoutes = require('./routes/cart.js');
const orderRoutes = require('./routes/orders.js');
const categoriesRoutes = require('./routes/categories.js');
const generalRoutes = require('./routes/general.js');
const lidhuMeDatabase = require('./database');
const PORT = process.env.PORT | 8080;
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

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
app.use(cookieParser());
app.use(flash());

//use routes
app.use('/', generalRoutes);
app.use('/users', userRoutes);
app.use('/products', productsRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoriesRoutes);

app.use(express.static(__dirname + '/public'));
app.engine('pug', require('pug').__express);
app.get('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get(`/:id`, getSingleCatProducts);

app.listen(PORT, () => {
  console.log(`server listening at http://localhost:${PORT}`);
});
