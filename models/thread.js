const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ThreadSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'user'
		},
		title: {
			type: String,
			validate: {
				validator: function(v) {
					return /^.{1,100}$/.test(v);
				},
				msg: 'is empty or exceeds 100 characters!'
			},
			required: [ true, 'Title is required (max. characters: 100)' ]
		},
		content: {
			type: String,
			validate: {
				validator: function(v) {
					return /^.+$/.test(v);
				},
				msg: 'Content is not valid or is empty!'
			},
			required: [ true, 'Content/Description is required' ]
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
	{ collection: 'threads' }
);

// Virtual field of upVotes count
ThreadSchema.virtual('upVotesCount').get(function() {
	return this.votesOfUsers.upVotes.length;
});

// Virtual field of downVotes count
ThreadSchema.virtual('downVotesCount').get(function() {
	return this.votesOfUsers.downVotes.length;
});

const Thread = mongoose.model('thread', ThreadSchema);

module.exports = Thread;
