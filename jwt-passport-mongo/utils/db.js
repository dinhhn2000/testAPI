const dotenv = require('dotenv')
dotenv.config()

//sets the required variables from Environment Variables.
const dbPassword = process.env.DB_PASSWORD;

const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true);
//fixes an issue with a depricated default in Mongoose.js
mongoose.connect(`mongodb+srv://dinhhn2000:${dbPassword}@clusterdemo-gevuw.mongodb.net/test?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(() => {
        console.log('Connected Successfully to MongoDB');
    })
    .catch(err => {
        console.error(err);
    });