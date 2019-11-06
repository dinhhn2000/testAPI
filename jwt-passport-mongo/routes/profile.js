const express = require('express');
const router = express.Router();
const passport = require('passport');
router.use(passport.initialize());
router.use(passport.session());
const fs = require('fs');

//imports the user model and the BcryptJS Library
// BcryptJS is a no setup encryption tool
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

var upload = multer({ storage: storage })

// Get user's profile
router.get('/', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.json(req.user);
});

// Get other user's profile
router.post('/otherUser', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    // Check existed user
    User.findById(req.body.userId)
        .then(user => {
            let userInfo = {};
            switch (user.method) {
                case 'local':
                    userInfo = {
                        id: user._id,
                        name: user.local.name,
                        email: user.local.emailAddress,
                        imageUrl: user.imageUrl,
                    };
                    break;
                case 'google':
                    userInfo = {
                        id: user._id,
                        name: user.google.name,
                        email: user.google.email,
                        imageUrl: user.imageUrl,
                    };
                    break;
                case 'facebook':
                    userInfo = {
                        id: user._id,
                        name: user.facebook.name,
                        email: user.facebook.email,
                        imageUrl: user.imageUrl,
                    };
                    break;
            }
            res.status(200).json(userInfo);
        })
        .catch(err => {
            console.error(err);
            res.status(404).json({ errmsg: 'User not found!' })
        });

});

// Update profile
router.post('/updateImageUrl',
    passport.authenticate('jwt', { session: false }),
    upload.single('avatarImage'),
    (req, res, next) => {
        // Save imageUrl
        // console.log("User: ", req.user);
        // console.log("File: ", req.file);
        User.findById(req.user.id)
            .then(user => {
                const updatedUser = user;
                const oldImageUrl = user.imageUrl;
                updatedUser.imageUrl = req.file.path;
                updatedUser.save()
                    .then(user => {
                        let { imageUrl } = user;
                        console.log(oldImageUrl);

                        if (!oldImageUrl.includes('default_user')) {
                            try {
                                fs.unlinkSync(oldImageUrl)
                                //file removed
                            } catch (err) {
                                console.error(err);
                                res.status(400).json({
                                    errmsg: "Cannot delete old user's avatar"
                                })
                            }
                        }

                        return res.status(200).json({
                            msg: "Update profile image success!!!",
                            avatar: imageUrl
                        })

                    })
                    .catch(err => {
                        res.status(400).json({
                            errmsg: "Cannot update user's avatar"
                        })
                    })
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({
                    errmsg: "Cannot find the user"
                })
            })
    })

router.post('/updateProfile',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        User.findById(req.user.id)
            .then(user => {
                const updatedUser = user;
                if (req.body.method === 'local') {
                    updatedUser.local.name = req.body.name;
                    updatedUser.local.password = req.body.password;
                }
                else if (req.body.method === 'google')
                    updatedUser.google.name = req.body.name;
                else
                    updatedUser.facebook.name = req.body.name;


                if (req.body.method === 'local') {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(updatedUser.local.password, salt, (err, hash) => {
                            if (err) throw err;
                            updatedUser.local.password = hash;
                            updatedUser.save()
                                .then(user => {
                                    return res.status(200).json({
                                        msg: "Update profile success!!!",
                                    })
                                })
                                .catch(err => {
                                    res.status(400).json({
                                        errmsg: "Cannot update user"
                                    })
                                })
                        });
                    });
                }
                else
                    updatedUser.save()
                        .then(user => {
                            return res.status(200).json({
                                msg: "Update profile success!!!",
                            })
                        })
                        .catch(err => {
                            res.status(400).json({
                                errmsg: "Cannot update user"
                            })
                        })
            })
            .catch(err => {
                console.log(err);
                res.status(400).json({
                    errmsg: "Cannot find the user"
                })
            })
    })

module.exports = router;
