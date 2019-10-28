const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    method: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        required: true
    },
    local: {
        name: String,
        emailAddress: {
            type: String,
            lowercase: true,
        },
        password: {
            type: String,
        }
    },
    google: {
        id: {
            type: String
        },
        name: String,
        email: {
            type: String,
            lowercase: true,
        }
    },
    facebook: {
        id: {
            type: String
        },
        name: String,
        email: {
            type: String,
            lowercase: true,
        }
    },

});
module.exports = User = mongoose.model('User', UserSchema);