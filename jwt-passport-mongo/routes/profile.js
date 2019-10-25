const express = require('express');
const router = express.Router();
const passport = require('passport');
router.use(passport.initialize());
router.use(passport.session());

/* GET home page. */
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json(req.user);
});

module.exports = router;
