const { Strategy, ExtractJwt } = require('passport-jwt');
//this is using ES6 Destructuring. If you're not using a build step,
//this could cause issues and is equivalent to
// const pp-jwt = require('passport-jwt');
// const Strategy = pp-jwt.Strategy;
// const ExtractJwt = pp-jwt.ExtractJwt;

const googleStrategy = require('passport-google-plus-token');

//this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token.
require('dotenv').config();
const secret = process.env.SECRET || '1612107';
// const mongoose = require('mongoose');
const User = require('./models/user');
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret
};

module.exports = passport => {
    // Local strategy
    passport.use(
        new Strategy(opts, (payload, done) => {
            // Check existed user
            User.findById(payload.id)
                .then(user => {
                    if (user) {
                        let userInfo = {
                            name: user.local.name,
                            email: user.local.emailAddress,
                        };
                        return done(null, userInfo);
                    }
                    return done(null, false);
                })
                .catch(err => console.error(err));
        })
    );

    // Google strategy
    passport.use('googleToken', new googleStrategy({
        clientID: '939914249395-rhkpsujosf1asma7g6pb7kj9sj0q2t2s.apps.googleusercontent.com',
        clientSecret: 'LwNoOmiRP90er-pb5wDS8yMB'
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        // console.log("profile", profile);

        // Check existed user
        User.findOne({ "google.id": profile.id })
            .then(user => {
                if (user) {
                    let userInfo = {
                        _id: user._id,
                        name: user.google.name,
                        email: user.google.email,
                    };
                    return done(null, userInfo);
                }

                // Create new account
                const newUser = new User({
                    method: 'google',
                    google: {
                        id: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    }
                });
                newUser.save()
                    .then(user => {
                        let { name, email } = user.google;
                        let { _id } = user;
                        done(null, { _id, name, email })
                    })
                    .catch(err => {
                        console.log(err);
                        done(null, false, err.message);
                    });
            })
            .catch(err => console.error(err));
    }));
};