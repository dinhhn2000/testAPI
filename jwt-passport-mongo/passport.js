const { Strategy, ExtractJwt } = require('passport-jwt');
const googleStrategy = require('passport-google-plus-token');
const googleStrategy1 = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook-token');

// this sets how we handle tokens coming from the requests that come
// and also defines the key to be used when verifying the token.
require('dotenv').config();
const secret = process.env.JWT_SECRET || '1612107';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const facebookClientId = process.env.FACEBOOK_CLIENT_ID;
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;

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
        clientID: googleClientId,
        clientSecret: googleClientSecret
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

    // Google strategy 
    passport.use('google', new googleStrategy1({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: "http://localhost:3000/login/googleOauth/callback",
        // scope: "https://www.googleapis.com/auth/userinfo.profile",
        passReqToCallback : true
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        console.log("profile", profile);

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

    // Facebook strategy
    passport.use('facebookToken', new facebookStrategy({
        clientID: facebookClientId,
        clientSecret: facebookClientSecret
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log("accessToken", accessToken);
        // console.log("refreshToken", refreshToken);
        console.log("profile", profile);

        // Check existed user
        User.findOne({ "facebook.id": profile.id })
            .then(user => {
                if (user) {
                    let userInfo = {
                        _id: user._id,
                        name: user.facebook.name,
                        email: user.facebook.email,
                    };
                    return done(null, userInfo);
                }

                // Create new account
                const newUser = new User({
                    method: 'facebook',
                    facebook: {
                        id: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    }
                });
                newUser.save()
                    .then(user => {
                        let { name, email } = user.facebook;
                        let { _id } = user;
                        done(null, { _id, name, email })
                    })
                    .catch(err => {
                        console.log(err.errmsg);
                        done(null, false, err.errmsg);
                    });
            })
            .catch(err => console.error(err));
    }));
};