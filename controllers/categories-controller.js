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
      const prodCat = await Product.find({ prodCategory: catId }).populate(
        'prodCategory'
      );
      console.log({ catId, prodCat });
      res.render('categories/llojiZgjedhur', { catId, prodCat });
    } catch (error) {
      console.log(error);
    }
  },
};
