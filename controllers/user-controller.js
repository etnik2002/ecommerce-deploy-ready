const bcrypt = require('bcrypt');

// import schemas

const User = require('../models/User');
const Product = require('../models/Product');

module.exports = {
  getUsers: (req, res) => {
    res.send('users page :)))');
  },
  getRegister: (req, res) => {
    res.render('users/signup');
  },
  postRegister: async (req, res) => {
    try {
      const { username, phone, email, password } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log({ hashedPassword });

      const newUser = new User({
        username,
        phone,
        email,
        password: hashedPassword,
      });

      const savedUser = await newUser.save();
      console.log(savedUser);

      res.redirect('/users/login');
    } catch (error) {
      console.log(error);
    }
  },
  getLogin: (req, res) => {
    const message = req.flash().message || [];
    res.render('users/login', { message });
  },

  getUserProfile: async (req, res) => {
    if (!req.user) {
      res.redirect('/users/login');
    }
    try {
      console.log({ req: req.user });
      const user = await User.findById({ _id: req.user.id }).populate('orders');
      res.render('users/profile', { user, message: req.flash('success') });
    } catch (error) {
      if (error) {
        console.log(error);
        res.render('users/profile', { user, message: req.flash('error') });
      }
    }
  },

  getUpdateUSer: async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/updateUser', { user });
  },

  postUpdateUser: async (req, res) => {
    if (!req.user) {
      res.redirect('/users/login/?login-to-update-yur-prolife');
    }
    try {
      const userUpdate = {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
      };

      let userId = {
        _id: req.params.id,
      };

      const updateUser = await User.findOneAndUpdate(userId, userUpdate);

      req.flash('success', `Account updated successfully!`);
      req.flash('error', `Something went wrong, please try again!`);

      if (updateUser) {
        res.redirect('/users/profile?updated=true');
      } else {
        res.redirect('/users/profile?updated=false');
      }
    } catch (error) {
      console.log(error);
    }
  },

  getOrderedProduct: async (req, res) => {
    const user = await User.findById({ _id: req.user.id }).populate('orders');
    console.log({ user });
    res.render('users/orderedProduct', { user });
  },
  postDeleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).lean();

      if (!user) {
        console.log('not logged in');
        res.redirect('/?user-not-found');
      }

      await User.deleteOne({ _id: req.params.id });

      console.log('u fshi');
      res.redirect('/?deleted=true');
    } catch (error) {
      console.log({ error });
      res.redirect('/users/profile?deleted=false');
    }
  },
};
