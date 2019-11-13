const express = require('express');
const assert = require('assert');
const bcrypt = require('bcryptjs');

const router = express.Router();

const User = require('../models/user');
const jwt = require('../helpers/jwt');

const logger = require('tracer').dailyfile({
	root: '../logs',
	maxLogFiles: 10,
	allLogsFileName: 'studdit-auth',
	format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
	dateformat: 'HH:MM:ss.L'
});

const saltRounds = 10;

// REGISTER NEW USER
router.post('/register', (req, res, next) => {
	try {
		const b = req.body;

		const hash = bcrypt.hashSync(b.password, saltRounds);

		const newUser = new User({
			userName: b.userName,
			password: hash
		});

		newUser
			.save()
			.then((message) => {
				res.status(200).json({ description: 'Succesfully logged in!', message: `${message.toString()}` });
				logger.log(`New user registrated: ${newUser.toString}`);
			})
			.catch((err) => {
				logger.error(err);
				console.error(err);

				res.status(500).json({ error: `${err}` });
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
					logger.log(`Logged in: user '${result.userName}'`);

					const token = jwt.encodeToken(result.userName);

					res.status(200).json({
						description: 'Succesful login!',
						token: `${token}`
					});
				} else {
					logger.log('Attempted login failed: ' + `${b}`);

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

module.exports = router;
