const Product = require('../models/Product');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const alert = require('alert');
const Order = require('../models/Order');
const Category = require('../models/Categories');
const Categories = require('../models/Categories');
const flash = require('connect-flash');

module.exports = {
  getProducts: async (req, res) => {
    const products = await Product.find({}).sort({ createdAt: 'desc' }).lean();
    res.render('products/main', { products });
  },
  getProductsAdmin: async (req, res) => {
    const products = await Product.find({}).lean();
    res.render('products/adminProducts', { products });
  },
  getCreateProduct: async (req, res) => {
    const categories = await Categories.find({});
    res.render('products/create', { categories });
  },
  postCreateProduct: async (req, res) => {
    try {
      const categories = await Category.find({}).lean();
      console.log(req.user, 'useri ');
      console.log(req.body, 'req body');
      const { prodName, prodDesc, prodPrice, prodCategory, size, prodColor } =
        req.body;

      const fotot = [];
      req.files.forEach((x) => {
        fotot.push(x.filename);
      });
      console.log({ fotot });

      const newProduct = new Product({
        prodName,
        prodDesc,
        prodPrice,
        prodCategory,
        prodColor,
        size,
        prodImg: fotot,
      });

      req.flash('success', `New order was successfully added!`);
      req.flash('error', `Something went wrong, please try again!`);

      const savedProduct = await newProduct.save();
      console.log({ savedProduct });
      res.redirect('/?product=created=true');
    } catch (error) {
      console.log(error);
      res.redirect('/?product=created=false');
    }
  },
  viewProduct: async (req, res) => {
    console.log('Product ID : ' + req.params.id);

    const cupons = ['etnik'];

    const user = await User.findById({ _id: req.params.id });
    console.log({ user });

    const singleProduct = await Product.find({ _id: req.params.id }).populate(
      'prodCategory'
    );
    console.log({ singleProduct });
    res.render('products/viewProduct', { singleProduct, cupons });
  },

  postAddToCart: async (req, res) => {
    try {
      const cart = [];

      const selectedProduct = await Product.findById({ _id: req.params.id });

      cart.push(selectedProduct);
      console.log({ cart });
      console.log({ selectedProduct });

      res.redirect('/cart/?success=true');
    } catch (error) {
      console.log(error);
      res.redirect('/products?success=false');
    }
  },
  getAddToCart: async (req, res) => {
    const cart = [];
    res.render('cart', { cart });
  },

  sendMail: async (req, res) => {
    try {
      console.log(req.body, 'req body');
      console.log({ p: req.params.id });
      const user = await User.find({ _id: req.user.id });
      const product = await Product.findById(req.params.id);

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

      let info = await transporter.sendMail({
        from: req.user.email,
        to: 'etnikz2002@gmail.com, dardanramani907@gmail.com',
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
          `This is the product they ordered :  http://localhost:5000/products/${req.params.id}` +
          ' ' +
          `and the quantity is ${req.body.quantity} items. Color : ${req.body.color}. Size : ${req.body.size}. Total Price : ${totalPrice}€`,
      });

      console.log('Message sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // alert(
      //   'Order Successfully placed! Delivery time will be sent to your email as soon as possible.'
      // );

      console.log(req.params.id);

      const saveUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { orders: req.params.id } },
        { new: true }
      );

      await saveUser.save();

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
        status: false,
      });
      const savedOrder = await newOrder
        .save()
        .then(console.log('true'))
        .catch('false');
      console.log({ savedOrder });

      res.redirect('/users/profile?order-placed=true');
    } catch (error) {
      console.log(error);
      return res.redirect('/products?ordered=false');
    }
  },

  getEditProduct: async (req, res) => {
    const user = await User.findById({ _id: req.user.id });
    const product = await Product.findById(req.params.id);

    res.render('products/editProduct', { product, user });
  },
  postEditProduct: async (req, res) => {
    try {
      const productUpdate = {
        prodName: req.body.prodName,
        prodDesc: req.body.prodDesc,
        prodPrice: req.body.prodPrice,
        prodCategory: req.body.prodCategory,
        isFeatured: req.body.isFeatured,
      };

      let prodId = {
        _id: req.params.id,
      };

      const updateProd = await Product.findOneAndUpdate(prodId, productUpdate);
      console.log(req.body);

      if (updateProd) {
        res.redirect('/users/profile?updated=PO');
        console.log('u bo update');
      } else {
        res.redirect('/users/profile?updated=JO');
        console.log('nuk u bo update');
      }
    } catch (error) {
      console.log(error);
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
      console.log(error);
      res.redirect('users/profile?deleted=JO');
    }
  },
};
