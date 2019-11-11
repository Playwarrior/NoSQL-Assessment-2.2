const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: String,
    password: String,
    registerDate: Date
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
