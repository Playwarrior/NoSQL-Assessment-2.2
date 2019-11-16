const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
	{
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
		content: {
			type: String,
			required: [ true, 'Content is required' ]
		},
		postDate: {
			type: Date,
			default: Date.now()
		},
		votesOfUsers: {
			upVotes: [
				{
					type: Schema.Types.ObjectId,
					ref: 'user'
				}
			],
			downVotes: [
				{
					type: Schema.Types.ObjectId,
					ref: 'user'
				}
			]
		}
	},
	{ collection: 'comments' }
);

// Virtual field of upVotes
CommentSchema.virtual('upVotesCount').get(function() {
	return this.votesOfUsers.upVotes.length;
});

// Virtual field of downVotes
CommentSchema.virtual('downVotesCount').get(function() {
	return this.votesOfUsers.downVotes.length;
});

const Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;
