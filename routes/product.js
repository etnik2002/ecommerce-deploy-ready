const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');
const { productUpload } = require('../middleware/multer');

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
} = require('../controllers/product-controller');
const Product = require('../models/Product');

router.get('/', getProducts);

router.get('/allProducts', isAdmin, getProductsAdmin);

router.get('/create', getCreateProduct);

router.post('/create', productUpload.array('prodImg'), postCreateProduct);

router.get('/:id', viewProduct);

router.get('/addToCart/:id', kerkohetIdentifikimi, getAddToCart);

router.post('/addToCart/:id', kerkohetIdentifikimi, postAddToCart);

router.get('/edit/:id', getEditProduct);

router.post('/edit/:id', postEditProduct);

router.post('/delete/:id', postDeleteProduct);

module.exports = router;
