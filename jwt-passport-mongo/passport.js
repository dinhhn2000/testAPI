const { Strategy, ExtractJwt } = require('passport-jwt');
//this is using ES6 Destructuring. If you're not using a build step,
//this could cause issues and is equivalent to
// const pp-jwt = require('passport-jwt');
// const Strategy = pp-jwt.Strategy;
// const ExtractJwt = pp-jwt.ExtractJwt;

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
    passport.use(
        new Strategy(opts, (payload, done) => {
            User.findById(payload.id)
                .then(user => {
                    if (user) {
                        let userInfo = {
                            id: user.id,
                            name: user.name,
                            email: user.emailAddress,
                        };
                        return done(null, userInfo);
                    }
                    return done(null, false);
                })
                .catch(err => console.error(err));
        })
    );
};