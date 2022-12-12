const passport = require('passport');
const User = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectId;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID:
        '1084136384054-uovbvjbit8ptn7h7j8hgbi1dns896inj.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
    }
  )
);

// var GoogleStrategy = require('passport-google-oauth2').Strategy;

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID:
//         '561754260668-hb413a9e95rjhc7n1ndncg2pamaplsi7.apps.googleusercontent.com',
//       clientSecret: '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',
//       callbackURL: 'http://localhost:3000/auth/google/callback',
//     },

//     function (accessToken, refreshToken, profile, done) {
//       // const user = new User({
//       //   username: profile.displayName,
//       //   // email: profile.email,
//       //   phone: profile.phone,
//       //   password: profile.password,
//       // });

//       // user.save();
//       // console.log({ user, usreiiiiii: 'useriiiii' });
//       done(null, profile);
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
