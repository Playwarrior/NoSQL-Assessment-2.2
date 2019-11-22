const express = require('express');
const assert = require('assert');
const bcrypt = require('bcryptjs');

const router = express.Router();

const User = require('../models/user');
const jwt = require('../helpers/jwt');

// Neo4j helper
const session = require('../helpers/neo4jUtils');

// Saltrounds for bcrypt
const saltRounds = 10;

// REGISTER NEW USER
router.post('/register', (req, res, next) => {
	try {
		const b = req.body;

		assert(typeof b.userName === 'string', 'Invalid Username');
		assert(typeof b.password === 'string', 'Invalid Password');

		const hash = bcrypt.hashSync(b.password, saltRounds);

		const newUser = new User({
			userName: b.userName,
			password: hash
		});

		newUser
			.save()
			.then((message) => {
				return message;
			})
			.then(() => {
				session
					.run(`CREATE (a:User {username: "${b.userName}", userId: "${newUser._id}"}) RETURN a.username;`)
					.then(() => {
						res.status(200).json({ description: 'Succesfully registered!' });
						session.close();
					})
					.catch((error) => {
						console.error(error);
						res.status(500).json({ message: 'Could not create user in Neo4j Db', error: error });
					});
			})
			.catch((err) => {
				console.error(err);

				res.status(500).json({ error: err });
			});
	} catch (ex) {
		res.status(500).json({ exception: `${ex.toString()}` });
		console.log(ex);
	}
});

// LOGIN
router.post('/login', (req, res, next) => {
	const b = req.body;

	try {
		assert(typeof b.userName === 'string', 'userName is not a string!');

		User.findOne({ userName: `${b.userName}` })
			.then((result) => {
				if (bcrypt.compareSync(b.password, result.password)) {
					const token = jwt.encodeToken(result._id);

					res.status(200).json({
						description: 'Succesful login!',
						token: `${token}`
					});
				} else {
					res.status(401).json({ description: 'Login failed' });
				}
			})
			.catch((error) => {
				res.status(500).json({ error: `${error}` });
			});
	} catch (ex) {
		res.status(500).json({ error: `${ex}` });
	}
});

router.put('/register', (req, res, next) => {
	try {
		const body = req.body;

		const bUsername = body.username;
		const bPass = body.password;
		const bNewPass = body.newPassword;

		assert(typeof bUsername === 'string', 'username is not a string!');
		assert(typeof bPass === 'string', 'password is not a string!');
		assert(typeof bNewPass === 'string', 'newPassword is not a string!');

		User.findOne({ userName: bUsername })
			.then((user) => {
				if (bcrypt.compareSync(bPass, user.password)) {
					User.findByIdAndUpdate(user._id, {
						password: bcrypt.hashSync(bNewPass, saltRounds)
					})
						.then(() => {
							res.status(200).json('User updated!');
						})
						.catch((error) => {
							next({ errorMessage: error });
						});
				} else {
					res.status(401).json('invalid password!');
				}
			})
			.catch((error) => {
				next(error);
			});
	} catch (ex) {
		next(ex);
	}
});

module.exports = router;
