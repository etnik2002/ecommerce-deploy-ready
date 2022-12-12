const router = require('express').Router();
const {
  kerkohetIdentifikimi,
  isAdmin,
  isCeo,
  hasPermissionToEditAndDelete,
} = require('../middleware/auth');
const { productUpload } = require('../middleware/multer');
const Product = require('../models/Product');

const {
  getProducts,
  getCreateProduct,
  postCreateProduct,
  viewProduct,
  postAddToCart,
  getAddToCart,
  sendMail,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
  getProductsAdmin,
  searchedProducts,
  postLikeProduct,
} = require('../controllers/product-controller');

router.get('/search', searchedProducts);

router.get('/', getProducts);

router.get('/allProducts', isAdmin, getProductsAdmin);

router.get('/ceo/all-products', isCeo, getProductsAdmin);

router.get('/create', getCreateProduct);

router.post('/create', productUpload.array('prodImg'), postCreateProduct);

router.get('/:id', viewProduct);

router.get('/addToCart/:id', kerkohetIdentifikimi, getAddToCart);

router.post('/addToCart/:id', kerkohetIdentifikimi, postAddToCart);

router.get('/edit/:id', getEditProduct);

router.post('/edit/:id', postEditProduct);

router.post('/delete/:id', postDeleteProduct);

router.post('/like/:id', postLikeProduct);

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

router.post('/payment-paypal', (req, res) => {
  paypal.payment.create(
    {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: 'http://localhost:3000?success=true',
        cancel_url: 'http://localhost:3000?success=false',
      },
      transactions: [
        {
          amount: {
            total: 5432,
            currency: 'USD',
          },
        },
      ],
    },

    function (err, payment) {
      if (err) {
        console.error({ err });
        res.redirect('/?payment-success=false');
      } else {
        console.log({ payment });
        res.status(201).json(payment);
      }
    }
  );
});

module.exports = router;
