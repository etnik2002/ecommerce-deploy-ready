const bcrypt = require('bcrypt');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

module.exports = {
  getUsers: (req, res) => {
    res.send('users page :');
  },
  getRegister: (req, res) => {
    res.render('users/signup');
  },

  postRegister: async (req, res) => {
    try {
      const { username, phone, email, password, city, address } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log({ hashedPassword });

      const newUser = new User({
        username,
        phone,
        email,
        password: hashedPassword,
        city,
        address,
      });

      const savedUser = await newUser.save();
      console.log(savedUser);

      res.redirect('/users/login');
    } catch (error) {
      console.log(error);
      res.redirect('/error');
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
      const user = await User.findById({ _id: req.user.id })
        .populate('orders')
        .populate('liked');

      const userID = req.user._id;

      const userOrders = await Order.find({ customer: userID })
        .populate('productID')
        .sort({ createdAt: 'desc' });

      console.log({ userOrders: userOrders });

      res.render('users/profile', {
        user,
        userOrders,
        message: req.flash('success'),
      });
    } catch (error) {
      console.log(error);
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
      console.error(error);
      res.redirect('/error');
    }
  },

  getOrderedProduct: async (req, res) => {
    const userID = req.user._id;

    const singleOrder = await Order.findById({ _id: req.params.id }).populate(
      'productID'
    );

    console.log({ singleOrder });
    res.render('users/orderedProduct', { singleOrder });
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
      console.error({ error });
      res.redirect('/error');
    }
  },
  ceoManageAdmins: async (req, res) => {
    const allAdmins = await User.find({ userRole: 'admin' }).sort({
      createdAt: 'desc',
    });

    const user = await User.findById({ _id: req.user.id });

    res.render('users/ceoManageAdmins', { allAdmins, user });
  },

  changeAdminRole: async (req, res) => {
    try {
      const selectedAdmin = await User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { userRole: req.body.changeRole } }
      );
      const newRole = await selectedAdmin.save();
      console.log({ newRole });
      res.redirect('/users/ceo-manage/admins?role-changer=true');
    } catch (error) {
      console.error(error);
      res.redirect('errors/404');
    }
  },

  adminGetAllUsers: async (req, res) => {
    const allUsers = await User.find({ userRole: 'user' });
    res.render('users/allUsers', { allUsers });
  },

  getResetPassword: async (req, res) => {
    res.render('users/resetPassword');
  },
  postResetPassword: async (req, res) => {
    try {
      const reset_pw_email = req.body.reset_pw_email;
      console.log({ email: reset_pw_email });

      const user = await User.findOne({ email: reset_pw_email });
      console.log({ user });

      const pw = req.body.newPassword;

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

      const ceoEmail = 'etnikz2002@gmail.com';

      let info = await transporter.sendMail({
        from: ceoEmail,
        to: reset_pw_email,
        subject: 'Password reset',
        html:
          `<h1>Hi ${user.username} , change your password here! </h1>` +
          `
          <form action="http://localhost:3000/users/password-reset" method="POST">
            <input type="text" name="newPassword" />
            <button type="submit" value="Submit">Reset</button>
          </form> 
          `,
      });

      console.log('Message sent: %s', info.messageId);

      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      try {
        const updateUser = await User.findOneAndUpdate(
          { email: reset_pw_email },
          pw
        );
        console.log({ updateUser });
      } catch (error) {
        console.log('error occured');
      }
      res.redirect('/?success=true');
    } catch (error) {
      console.error(error);
    }
  },
  getSendInfoEmail: async (req, res) => {
    res.render('users/infoemail');
  },
  postSendInfoEmail: async (req, res) => {
    const email_content = req.body.emailContent;
    const allUsers = await User.find({ userRole: 'user' });
    var emails = [];
    for (let i = 0; i < allUsers.length; i++) {
      emails.push(allUsers[i].email);
    }
    console.log({ emails });

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

    let info = await transporter.sendMail({
      from: 'etnikz2002@gmail.com',
      to: emails,
      subject: req.body.subject,
      text: req.body.header,
      html: req.body.emailContent,
      // html: `<h3>We hope this email finds you well. We wanted to remind you about our latest product line that was recently released. Our new products include [list of new products] and we believe they would make a great addition to your [product use].

      //   We would love for you to take a look at them and let us know if you have any questions or need any assistance.

      //   Thank you for your continued business.</h3>
      //   Sincerely,
      //   Etnik Zeqiri
      //   `,
    });

    console.log('Message sent: %s', info.messageId);

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.redirect('/admin');
  },
};
