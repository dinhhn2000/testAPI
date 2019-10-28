//imports the user model and the BcryptJS Library
// BcryptJS is a no setup encryption tool
const User = require('../models/user');
const bcrypt = require('bcryptjs');

//gives us access to our environment variables 
//and sets the secret object.
require('dotenv').config();
const secret = process.env.SECRET || '1612107';

//imports Passport and the JsonWebToken library for some utilities
const passport = require('passport');
require('../passport')(passport);
const jwt = require('jsonwebtoken');

module.exports = (app) => {
  app.post('/register', (req, res) => {
    User.findOne({ "local.emailAddress": req.body.email })
      .then(user => {
        if (user) {
          let error = 'Email Address Exists in Database.';
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

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    setTimeout(() => {
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
                  name: user.name
                };
                jwt.sign(payload, secret, { expiresIn: '1d' },
                  (err, token) => {
                    if (err) res.status(500)
                      .json({
                        error: "Error signing token",
                        raw: err
                      });
                    res.json({
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
    }, 2000);

  });

  app.post('/login/googleOauth',
    passport.authenticate('googleToken', { session: false }),
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
}