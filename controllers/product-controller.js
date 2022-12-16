const Product = require('../models/Product');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const alert = require('alert');
const Order = require('../models/Order');
const Category = require('../models/Categories');
const Categories = require('../models/Categories');
const flash = require('connect-flash');
const { NetworkContext } = require('twilio/lib/rest/supersim/v1/network');
const { assign } = require('nodemailer/lib/shared');

module.exports = {
  getProducts: async (req, res) => {
    const prod = await Product.find({}).lean();

    const categories = await Categories.find({ active: true }).sort({
      createdAt: 'desc',
    });

    let perPage = 9;
    let page = req.query.page || 1;
    const products = await Product.find({})
      .sort({ createdAt: 'desc' })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec((err, products) => {
        Product.countDocuments().exec((err, count) => {
          if (err) {
            console.log(err);
          }

          res.render('products/main', {
            products,
            categories,
            current: page,
            pages: Math.ceil(count / perPage),
          });
        });
      });
  },

  getProductsAdmin: async (req, res) => {
    const products = await Product.find({}).lean();
    res.render('products/adminProducts', { products });
  },

  getCreateProduct: async (req, res) => {
    const categories = await Categories.find({ active: true });
    res.render('products/create', { categories });
  },

  postCreateProduct: async (req, res) => {
    try {
      const product = await Product.find(req.params.id);
      const categories = await Category.find({ active: true }).lean();
      console.log(req.user, 'useri ');
      console.log(req.body, 'req body');
      const {
        prodName,
        prodDesc,
        prodPrice,
        discount,
        prodCategory,
        size,
        prodColor,
        inStock,
      } = req.body;

      const fotot = [];
      req.files.forEach((x) => {
        fotot.push(x.filename);
      });

      const newProduct = new Product({
        prodName,
        prodDesc,
        prodPrice,
        discount,
        prodCategory,
        prodColor,
        size,
        prodImg: fotot,
        inStock,
      });

      req.flash('success', `New product was successfully added!`);
      req.flash('error', `Something went wrong, please try again!`);

      const savedProduct = await newProduct.save();

      res.redirect('/?product=created=true');
    } catch (error) {
      console.error(error);
      res.redirect('/?product=created=false');
    }
  },

  viewProduct: async (req, res) => {
    const categories = await Categories.find({ active: true }).sort({
      createdAt: 'desc',
    });

    const singleProduct = await Product.find({ _id: req.params.id }).populate(
      'prodCategory'
    );
    console.log({ singleProduct });
    const prod = await Product.findById(req.params.id).lean();

    const recommendedProducts = await Product.find({
      prodCategory: prod.prodCategory,
    })
      .populate('prodCategory')
      .limit(4)
      .sort({ createdAt: 'desc' });

    const inDiscount = await Product.find({
      discount: { $gt: 0 },
    })
      .populate('prodCategory')
      .limit(4);

    const key =
      'pk_test_51K1DdaDAZApOs2EVXCiMmQnlAa9TIqCpnuhrDrpiKqdTGuGlNvbbyYnaEPgl2m0Qg2WfBC6r6j2wfP2jLdDwPdnm00D2bcqz6v';

    res.render('products/viewProduct', {
      singleProduct,
      recommendedProducts,
      inDiscount,
      categories,
      prod,
      key,
    });
  },

  postAddToCart: async (req, res) => {
    try {
      const cart = [];

      const selectedProduct = await Product.findById({ _id: req.params.id });

      cart.push(selectedProduct);

      res.redirect('/cart/?success=true');
    } catch (error) {
      console.error(error);
      res.redirect('/products?success=false');
    }
  },

  getAddToCart: async (req, res) => {
    const cart = [];
    res.render('cart', { cart });
  },

  sendMail: async (req, res) => {
    if (!req.user) {
      req.flash('error', 'Please login to place the order!');
      return res.render('users/login', { message: req.flash('error') });
    }

    try {
      console.log(req.body, 'req body');
      console.log({ p: req.params.id });
      const product = await Product.findById(req.params.id);
      const user = await User.find({ _id: req.user.id });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth: {
          user: 'etnikz2002@gmail.com',
          pass: 'vysmnurlcmrzcwad',
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const totalPrice = req.body.quantity * product.prodPrice;

      const takenFromTotal =
        (product.prodPrice * req.body.quantity * product.discount) / 100;
      const total = totalPrice - takenFromTotal;

      let info = await transporter.sendMail({
        from: req.user.email,
        to: 'etnikz2002@gmail.com',
        subject: 'Someone placed a new order!',
        text: req.user.username + ' ' + 'just placed a new order!',
        html:
          `<h1>New Order ↓ </h1>` +
          'Customers Email : ' +
          req.user.email +
          ', ' +
          ' Their phone number : ' +
          req.body.phone +
          '<br> ' +
          ' Their address : ' +
          req.body.address +
          ' ' +
          ', City : ' +
          req.body.city +
          '<br> ' +
          req.user.username +
          ' ' +
          'just placed a new order!' +
          ' ' +
          '.                  .' +
          `This is the product they ordered :  http://localhost:8081/products/${req.params.id}` +
          ' ' +
          `and the quantity is ${req.body.quantity} items. Color : ${
            req.body.color
          }. Size : ${req.body.size}. Total Price : ${total.toFixed(2)}den`,
      });

      let info2 = await transporter.sendMail({
        from: 'etnikz2002@gmail.com',
        to: req.user.email,
        subject: 'Your order was successfully placed!',
        html:
          `<h1>Order placed successfully ↓ </h1>` +
          'just placed a new order!' +
          ' ' +
          '.                  .' +
          `This is the product you ordered :  http://localhost:8081/products/${req.params.id}` +
          ' ' +
          `and the quantity is ${req.body.quantity} items. Color : ${
            req.body.color
          }. Size : ${req.body.size}. Total Price : ${total.toFixed(2)}den`,
      });

      console.log('Message sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // console.log('Message sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info2));

      req.flash('success', `Order successfully placed!`);
      req.flash('error', `Something went wrong, please try again!`);

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

      res.redirect('/users/profile?order-placed=true');
    } catch (error) {
      console.error(error);
      return res.redirect('/products?ordered=false');
    }
  },

  getEditProduct: async (req, res) => {
    const user = await User.findById({ _id: req.user.id });
    const product = await Product.findById(req.params.id);

    res.render('products/editProduct', { product, user });
  },
  postEditProduct: async (req, res) => {
    const product = await Product.findById(req.params.id);
    try {
      const productUpdate = {
        prodName: product.prodName,
        prodDesc: req.body.prodDesc,
        prodPrice: req.body.prodPrice,
        discount: req.body.discount,
        prodCategory: req.body.prodCategory,
        isFeatured: req.body.isFeatured,
        inStock: req.body.inStock,
        prodColor: req.body.prodColor,
      };

      let prodId = {
        _id: req.params.id,
      };

      const updateProd = await Product.findOneAndUpdate(prodId, productUpdate);

      if (updateProd) {
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
  postDeleteProduct: async (req, res) => {
    console.log(req.params);
    // const user = req.user;
    try {
      let produkti = await Product.findById(req.params.id).lean();
      console.log({ produkti });
      if (!produkti) {
        res.redirect('users/profile?sukses=JO');
      }
      // if (req.user.userRole == 'admin') {
      //   res.redirect('/users/profile?sukses=PO');
      // }
      else {
        await Product.deleteOne({ _id: req.params.id });
        console.log('deleted = true');
        res.redirect('/users/profile?sukses=PO');
      }
    } catch (error) {
      console.error(error);
      res.redirect('users/profile?deleted=JO');
    }
  },

  postLikeProduct: async (req, res) => {
    try {
      const user = await User.find({ _id: req.user.id }).populate('liked');
      const product = await Product.findById(req.params.id).lean();

      console.log({ user, product });

      const addLike = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { liked: product._id } },
        { new: true }
      );
      await addLike.save();

      const assignLike = await Product.findOneAndUpdate(
        { _id: product._id },
        { $push: { usersLikedThis: req.user.id } },
        { new: true }
      );

      const saved = await assignLike.save();
      console.log({ saved });

      console.log('product liked');
      res.redirect('/products');
    } catch (error) {
      res.render('errors/404');
      console.error(error);
    }
  },
  searchedProducts: async (req, res) => {
    let query = req.query.search;
    const user = await User.findById({ _id: req.user.id });
    const categories = await Category.find({});
    console.log({ query });
    Product.find(
      {
        $text: { $search: query },
      },
      (err, newSearch) => {
        try {
          res.render('products/main', {
            products: newSearch,
            categories,
            user,
          });
        } catch (err) {
          if (err) {
            res.redirect('errors/404');
            console.error(err);
          }
          if (newSearch.length < 0) {
            res.redirect('/');
          }
        }
      }
    );
  },
};
