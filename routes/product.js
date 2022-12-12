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

module.exports = router;
