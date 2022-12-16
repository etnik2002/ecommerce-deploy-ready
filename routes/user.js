const router = require('express').Router();
const passport = require('passport');
const { kerkohetIdentifikimi, isAdmin, isCeo } = require('../middleware/auth');
const flash = require('connect-flash');
const User = require('../models/User');

const {
  getUsers,
  getRegister,
  postRegister,
  getLogin,
  getUserProfile,
  getUpdateUSer,
  getOrderedProduct,
  postUpdateUser,
  postDeleteUser,
  ceoManageAdmins,
  changeAdminRole,
  adminGetAllUsers,
  getResetPassword,
  postResetPassword,
  getSendInfoEmail,
  postSendInfoEmail,
} = require('../controllers/user-controller');

router.get('/', getUsers);

router.get('/register', getRegister);

router.post('/register', postRegister);

router.get('/login', getLogin);

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    successRedirect: '/?login=success',
    failureRedirect: '/users/login?succes=false',
  })
);

router.get('/profile', kerkohetIdentifikimi, getUserProfile);

router.get('/logout', (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/users/login?logout=true');
  });
});

router.get('/ordered/:id', kerkohetIdentifikimi, getOrderedProduct);

router.get('/update/:id', getUpdateUSer);

router.post('/update/:id', postUpdateUser);

router.post('/delete/:id', postDeleteUser);

router.get('/allAdmins', async (req, res) => {
  const admins = await User.find({ userRole: 'admin' });
  res.render('users/allAdmins', { admins });
});

router.get('/ceo-manage/admins', ceoManageAdmins);

router.post('/ceo/change-user-role/:id', isCeo, changeAdminRole);

router.get('/all-users', isCeo, adminGetAllUsers);

router.get('/password-reset', getResetPassword);

router.post('/password-reset', postResetPassword);

router.get('/send-info-email', getSendInfoEmail);

router.post('/send-info-email', postSendInfoEmail);

module.exports = router;
