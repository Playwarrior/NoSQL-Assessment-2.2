const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    threadId: {
        type: Schema.Types.ObjectId,
        ref: 'thread'
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'comment'
    },
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

const Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;
