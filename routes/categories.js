const router = require('express').Router();
const Product = require('../models/Categories');
const {
  postCreateCategory,
  getAllCategories,
} = require('../controllers/categories-controller');
const { catUpload } = require('../middleware/multer');
const Categories = require('../models/Categories');

const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');

router.get('/create', async (req, res) => {
  const categories = await Categories.find({}).lean();
  res.render('categories/create', { categories });
});

router.post('/create', catUpload.single('catImg'), isAdmin, postCreateCategory);

router.get('/allCategories', isAdmin, getAllCategories);

module.exports = router;
