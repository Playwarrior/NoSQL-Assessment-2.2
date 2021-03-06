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
    User.findOne({_id: res.get('id')}, {registerDate: 1, userName: 1})
        .then((user) => {
            if (user === null)
                res.status(204).json('No user found!');

            else {
                res.status(200).json({
                    registerDate: user.registerDate,
                    userName: user.userName
                });
            }
        })
        .catch((error) => {
            next(error);
        });
});

router.get('/comments', (req, res, next) => {
    Comment.find({userId: res.get('id')})
        .then((comments) => {
            res.status(200).json(comments);
        })
        .catch((error) => {
            next(error);
        });
});

router.get('/threads', (req, res, next) => {
    Thread.find({userId: res.get('id')})
        .then((threads) => {
            res.status(200).json(threads);
        })
        .catch((error) => {
            next(error);
        });
});

router.delete('/', (req, res, next) => {
	const id = res.get('id');

	const password = req.body.password;

	User.findOne({ _id: res.get('id') })
		.then((user) => {
			if (bcrypt.compareSync(password, user.password)) {
				User.findByIdAndRemove(res.get('id'))
					.then(() => {
						// First delete all friendship relation
						session
							.run(`MATCH (:User {userId: "${id}"})-[r:FRIENDED]-(:User) DELETE r;`)
							.then(() => {
								// Then delete User
								session.run(`MATCH (u:User {userId: "${id}"}) DELETE u;`).catch((error) => {
									res.status(500).json({ message: `Unable to find user`, error: error });
								});
							})
							.then(() => {
								res.status(200).json({ message: `User ${id} succesfully deleted!` });
							})
							.catch((error) => {
								res.status(500).json({ message: 'Unable to find user', error: error });
							});
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
