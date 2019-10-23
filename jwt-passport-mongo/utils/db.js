//sets the required variables from Environment Variables.
const dbPort = process.env.DB_PORT || 27017;
const dbUrl = process.env.DB_URL || "localhost";
const dbCollection = process.env.DB_COLLECTION || "auth-test";

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
//fixes an issue with a depricated default in Mongoose.js
mongoose.connect(`mongodb://${dbUrl}/${dbCollection}`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => {
        console.log('Connected Successfully to MongoDB');
    })
    .catch(err => {
        console.error(err);
    });