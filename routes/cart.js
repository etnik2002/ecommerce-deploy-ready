const router = require('express').Router();
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');
const { sendMail } = require('../controllers/product-controller');
const Product = require('../models/Product');

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(req.body);
  res.render('cart');
});

router.post('/:id', sendMail);

// router.post('/add/:id');

module.exports = router;
