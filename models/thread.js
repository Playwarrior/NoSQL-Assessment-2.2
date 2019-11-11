const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: String,
    content: String,
    postDate: Date,
    votesOfUsers: {
        upVotes: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }],
        downVotes: [{
            type: Schema.Types.ObjectId,
            ref: 'user'
        }]
    }
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;
