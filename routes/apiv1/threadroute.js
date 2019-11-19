const express = require('express');
const router = express.Router();

const assert = require('assert');

// Neo4j helper
const session = require('../../helpers/neo4jUtils');

// Import ObjectId
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../../models/user');
const Thread = require('../../models/thread');
const Comment = require('../../models/comment');

function getSortCriteria(query) {
	const sort = {};

	if (query.upvotes) {
		sort.upVotesCount = 1;
	}

	if (query.downvotes) {
		sort.downVotesCount = 1;
	}

	if (query.comments) {
		sort.commentCount = 1;
	}

	return sort;
}

router.post('', (req, res, next) => {
	try {
		const thread = new Thread({
			userId: res.get('id'),
			title: req.body.title,
			content: req.body.content
		});

		thread
			.save()
			.then(() => {
				res.status(200).json('Thread created');
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

router.post('/:id/comment', (req, res, next) => {
	//TODO: CHECK IF THREAD EXISTS

	try {
		const comment = new Comment({
			userId: res.get('id'),
			threadId: req.params.id,
			content: req.body.content
		});

		comment
			.save()
			.then(() => {
				res.status(200).json('Comment created!');
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

router.post('/:id/comment/:comment', (req, res, next) => {
	try {
		//TODO: CHECK IF COMMENTS EXISTS!
		const comment = new Comment({
			userId: res.get('id'),
			commentId: req.params.comment,
			threadId: req.params.id,
			content: req.body.content
		});

		comment
			.save()
			.then(() => {
				res.status(200).json('Comment created!');
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

router.put('/:id/upvote', (req, res, next) => {
	try {
		Thread.findById(req.params.id).then((thread) => {
			//TODO: CHECK NULL
			let upVotes = thread.votesOfUsers.upVotes;
			let downVotes = thread.votesOfUsers.downVotes;

			if (!upVotes.includes(res.get('id'))) {
				upVotes.push(res.get('id'));
				downVotes.remove(res.get('id'));
			}

			Thread.findByIdAndUpdate(req.params.id, {
				votesOfUsers: {
					upVotes: upVotes,
					downVotes: downVotes
				}
			}).then(() => {
				res.status(200).json('Upvoted thread!');
			});
		});
	} catch (ex) {
		next(ex);
	}
});

router.put('/:id/downvote', (req, res, next) => {
	try {
		Thread.findById(req.params.id).then((thread) => {
			//TODO: ADD NULL!
			let upVotes = thread.votesOfUsers.upVotes;
			let downVotes = thread.votesOfUsers.downVotes;

			if (!downVotes.includes(res.get('id'))) {
				upVotes.remove(res.get('id'));
				downVotes.push(res.get('id'));
			}

			Thread.findByIdAndUpdate(req.params.id, {
				votesOfUsers: {
					upVotes: upVotes,
					downVotes: downVotes
				}
			}).then(() => {
				res.status(200).json('Downvoted thread!');
			});
		});
	} catch (ex) {
		next(ex);
	}
});

router.get('', (req, res, next) => {
	Thread.find()
		.sort(getSortCriteria(req.query))
		.then((threads) => {
			res.status(200).json(threads);
		})
		.catch((error) => {
			next(error);
		});
});

router.get('/:id', (req, res, next) => {
	Promise.all([
		Thread.findOne({ _id: req.params.id }),
		Comment.find({ threadId: req.params.id }).populate({
			path: 'user'
		})
	])
		.then((result) => {
			res.status(200).json({
				thread: result[0],
				comments: result[1]
			});
		})
		.catch((error) => {
			next(error);
		});
});

// GET: updates from friends
router.get('/updates/friends', (req, res, next) => {
	assert(typeof req.body.length === 'number', 'length is not a valid number!');

	const userId = res.get('id');
	const getLength = req.body.length;

	if (req.body.length < 1) {
		getLength = 1;
	}

	try {
		session
			.run(`MATCH (a:User {userId: "${userId}"})-[r*1..${getLength}]-(b) return collect(DISTINCT b.userId);`)
			.then((result) => {
				const values = result.records[0]._fields[0];

				const valuesArray = [];

				for (i = 0; i < values.length; i++) {
					valuesArray.push(ObjectId(values[i]));
				}

				return valuesArray;
			})
			.then((valuesArray) => {
				Thread.find({ userId: { $in: valuesArray } })
					.then((threads) => {
						res.status(200).json({ threads });
					})
					.catch((error) => {
						res.status(500).json({ message: `Unable to find any threads`, error: error });
					});
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to find any friendship relation`, error: error });
			});

		session.close();
	} catch (ex) {
		next(ex);
	}
});

router.put('/:id', (req, res, next) => {
	try {
		Thread.findOneAndUpdate(
			{ _id: req.params.id, userId: res.get('id') },
			{
				content: req.body.content
			}
		)
			.then(() => {
				//TODO: ADD MESSAGE WHEN AUTHORISATION IS NOT VALID!
				res.status(200).json('Thread is updated!');
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

router.delete('/:id', (req, res, next) => {
	try {
		Promise.all([
			Thread.findOneAndRemove({ _id: req.params.id, userId: res.get('id') }),
			Comment.deleteMany({ threadId: req.params.id })
		])
			.then(() => {
				//TODO: ADD MESSAGE WHEN AUTHORISATION IS NOT VALID!
				res.status(200).json('Thread has been deleted!');
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

module.exports = router;
