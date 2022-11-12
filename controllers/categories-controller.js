const Category = require('../models/Categories');
const Product = require('../models/Product');
const User = require('../models/User');
const slugify = require('slugify');

module.exports = {
  postCreateCategory: async (req, res) => {
    try {
      const newCat = new Category({
        catName: req.body.catName,
        catDesc: req.body.catDesc,
        catSlug: slugify(req.body.catName),
        catImg: req.file.filename,
      });
      const savedCat = await newCat.save();
      console.log({ savedCat });
      res.redirect('/?newCategory=created');
    } catch (error) {
      if (error) {
        console.log(error);
        res.redirect('/?newCategory=notCreated');
      }
    }
  },

  getAllCategories: async (req, res) => {
    const allCategories = await Category.find({});
    res.render('categories/allCategories', { allCategories });
  },

  getSingleCatProducts: async (req, res) => {
    try {
      const catId = await Category.findById(req.params.id).lean();
      const categories = await Category.find({ active: true });
      const prodCat = await Product.find({ prodCategory: catId }).populate(
        'prodCategory'
      );

      res.render('categories/llojiZgjedhur', { catId, prodCat, categories });
    } catch (error) {
      console.log(error);
    }
  },

  getEditCategory: async (req, res) => {
    const user = await User.findById({ _id: req.user.id });
    const category = await Category.findById(req.params.id);

    res.render('categories/editCategory', { category, user });
  },
  postEditCategory: async (req, res) => {
    const category = await Category.findById(req.params.id);
    try {
      const CategoryUpdate = {
        catName: req.body.catName,
        catDesc: req.body.catDesc,
        active: req.body.active,
      };

      let catId = {
        _id: req.params.id,
      };

      const updateCategory = await Category.findOneAndUpdate(
        catId,
        CategoryUpdate
      );

      if (updateCategory) {
        res.redirect('/users/profile?updated=PO');
        console.log('u bo update');
      } else {
        res.redirect('/users/profile?updated=JO');
        console.log('nuk u bo update');
      }
    } catch (error) {
      console.error(error);
    }
  },
};
