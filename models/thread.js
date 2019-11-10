const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
    //TODO
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;
