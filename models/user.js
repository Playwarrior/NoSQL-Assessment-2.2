const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    //TODO
});

const User = mongoose.model('comment', UserSchema);

module.exports = User;
