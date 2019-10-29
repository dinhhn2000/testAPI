//imports the user model and the BcryptJS Library
// BcryptJS is a no setup encryption tool
const User = require('../models/user');
const bcrypt = require('bcryptjs');

//gives us access to our environment variables 
//and sets the secret object.
require('dotenv').config();
const secret = process.env.JWT_SECRET || '1612107';

//imports Passport and the JsonWebToken library for some utilities
const passport = require('passport');
require('../passport')(passport);
const jwt = require('jsonwebtoken');

module.exports = (app) => {
  // Register route 
  app.post('/register', (req, res) => {
    // For local account
    User.findOne({ "local.emailAddress": req.body.email })
      .then(user => {
        if (user) {
          let error = { errmsg: 'Email Address Exists in Database.' };
          return res.status(400).json(error);
        } else {
          const newUser = new User({
            method: 'local',
            local: {
              name: req.body.name,
              emailAddress: req.body.email,
              password: req.body.password,
            }
          });
          bcrypt.genSalt(10, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(newUser.local.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.local.password = hash;
              newUser.save()
                .then(user => {
                  let { _id, name, emailAddress } = user.local;
                  res.json({ _id, name, emailAddress });
                })
                .catch(err => res.status(400).json(err));
            });
          });
        }
      });
  });

  // Login route (Both local and Google will use this route)
  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // For local account
    if (req.body.method === "local") {
      console.log("Local sign in");

      User.findOne({ "local.emailAddress": email })
        .then(user => {
          if (!user) {
            let errors = { Email: "No Account Found" };
            return res.status(404).json(errors);
          }
          bcrypt.compare(password, user.local.password)
            .then(isMatch => {
              if (isMatch) {
                const payload = {
                  id: user._id,
                  name: user.local.name
                };
                jwt.sign(payload, secret, { expiresIn: '1d' },
                  (err, token) => {
                    if (err) res.status(500)
                      .json({
                        error: "Error signing token",
                        raw: err
                      });
                    res.status(200).json({
                      success: true,
                      token: `Bearer ${token}`,
                      name: payload.name
                    });
                  });
              } else {
                errors.password = "Password is incorrect";
                return res.status(400);
              }
            }).catch(err => {
              console.log("Password is incorrect");
              let errors = { Email: "Password is incorrect" };
              return res.status(404).json(errors);
            })
        })
        .catch((err) => {
          console.log(err);
          return res.status(404).json(err);
        })
    }

    // For Google account
    if (req.body.method === "google") {
      console.log("Google sign in");

      User.findOne({ "google.email": email })
        .then(user => {
          if (user) {
            const payload = {
              id: user._id,
              name: user.google.name
            };
            jwt.sign(payload, secret, { expiresIn: '1d' },
              (err, token) => {
                if (err) return res.status(500)
                  .json({
                    error: "Error signing token",
                    raw: err
                  });
                return res.status(200).json({
                  success: true,
                  token: `Bearer ${token}`,
                  name: payload.name
                });
              });
          }
          else {
            // Create new account
            const newUser = new User({
              method: 'google',
              google: {
                id: req.body.id,
                name: req.body.name,
                email: req.body.email,
              }
            });
            newUser.save()
              .then(user => {
                const payload = {
                  id: user._id,
                  name: user.google.name
                };
                jwt.sign(payload, secret, { expiresIn: '1d' },
                  (err, token) => {
                    if (err) res.status(500)
                      .json({
                        error: "Error signing token",
                        raw: err
                      });
                    res.status(200).json({
                      success: true,
                      token: `Bearer ${token}`,
                      name: payload.name
                    });
                  });
              })
              .catch(err => {
                console.log(err);
                return res.status(400).json({ error: err });
              });
          }
        })
        .catch(err => console.error(err));
    }
  });

  // Facebook login route
  app.post('/login/facebookOauth',
    passport.authenticate('facebookToken', { session: false }),
    (req, res, next) => {
      const payload = {
        id: req.user._id,
        name: req.user.name
      };
      jwt.sign(payload, secret, { expiresIn: '1d' },
        (err, token) => {
          if (err) res.status(500)
            .json({
              error: "Error signing token",
              raw: err
            });
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            name: payload.name
          });
        });
    });

  /* GET users listing. */
  app.get('/', function (req, res, next) {
    res.send('Welcome to my API');
  });





  // Googe login route (WON'T BE USED) => The API problem still cannot fix
  app.post('/login/googleOauth',
    passport.authenticate('google', {
      session: false,
      scope: ['email', 'profile']
    }),
    (req, res, next) => {
      const payload = {
        id: req.user._id,
        name: req.user.name
      };
      jwt.sign(payload, secret, { expiresIn: '1d' },
        (err, token) => {
          if (err) res.status(500)
            .json({
              error: "Error signing token",
              raw: err
            });
          res.status(200).json({
            success: true,
            token: `Bearer ${token}`,
            name: payload.name
          });
        });
    });

  app.get('/login/googleOauth/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/');
    });

}
