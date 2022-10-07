const router = require('express').Router();
const passport = require('passport');
const { kerkohetIdentifikimi, isAdmin } = require('../middleware/auth');
const flash = require('connect-flash');

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

module.exports = router;
