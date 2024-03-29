const router = require('express').Router();
const Product = require('../models/Categories');
const {
  postCreateCategory,
  getAllCategories,
  postEditCategory,
  getEditCategory,
} = require('../controllers/categories-controller');
const { catUpload } = require('../middleware/multer');
const Categories = require('../models/Categories');

const {
  kerkohetIdentifikimi,
  isAdmin,
  hasPermissionToEditAndDelete,
} = require('../middleware/auth');

router.get('/create', async (req, res) => {
  const categories = await Categories.find({}).lean();
  res.render('categories/create', { categories });
});

router.post('/create', catUpload.single('catImg'), isAdmin, postCreateCategory);

router.get('/allCategories', hasPermissionToEditAndDelete, getAllCategories);

router.get('/update/:id', hasPermissionToEditAndDelete, getEditCategory);

router.post('/update/:id', postEditCategory);

module.exports = router;
