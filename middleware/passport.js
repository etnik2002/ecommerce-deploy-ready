const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const flash = require('connect-flash');
// const mongoose = require('mongoose');
// const ObjectId = require('mongodb').ObjectId;
// var GoogleStrategy = require('passport-google-oauth2').Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, function (
      email,
      password,
      done
    ) {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(
            null,
            false,
            { message: 'emaili nuk egziston' },
            // req.flash('error', 'Wrong credenticals, please try again!'),
            console.log('nuk egziston emaili')
          );
        }

        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            return done(err);
          }
          if (res === false) {
            return done(
              null,
              false,
              {
                message: 'te dhena te gabuara. provo perseri!',
              },
              // req.flash('error', 'Wrong credenticals, please try again!'),
              console.log('te dhena te gabuara. provo perseri!')
            );
          }

          return done(
            null,
            user,
            console.log('u bone llogin , urimeeeee :)))')
          );
        });
      });
    })
  );

  //serialize ene deserialize user

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
