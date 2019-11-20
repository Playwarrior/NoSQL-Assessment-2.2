const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

// Neo4j helper
const session = require('../../helpers/neo4jUtils');
const jwt = require('../../helpers/jwt');

const User = require('../../models/user');
const Comment = require('../../models/comment');
const Thread = require('../../models/thread');

router.get('', (req, res, next) => {
	User.findOne({ _id: res.get('id') }, { registerDate: 1, userName: 1 })
		.then((user) => {
			console.log(user);

			res.status(200).json({
				registerDate: user.registerDate,
				userName: user.userName
			});
		})
		.catch((error) => {
			next(error);
		});
});

router.get('/comments', (req, res, next) => {
	Comment.find({ userId: res.get('id') })
		.then((comments) => {
			res.status(200).json(comments);
		})
		.catch((error) => {
			next(error);
		});
});

router.get('/threads', (req, res, next) => {
	Thread.find({ userId: res.get('id') })
		.then((threads) => {
			res.status(200).json(threads);
		})
		.catch((error) => {
			next(error);
		});
});

router.delete('/', (req, res, next) => {
	const password = req.body.password;

	User.findOne(res.get('id'))
		.then((user) => {
			if (bcrypt.compareSync(password, user.password)) {
				User.findByIdAndRemove(res.get('id'))
					.then(() => {
						res.status(200).json('user deleted!');
					})
					.catch((error) => {
						next(error);
					});
			} else {
				res.status(403).json({ message: 'Not authorized to do this action!' });
			}
		})
		.catch((error) => {
			next(error);
		});
});

module.exports = router;
