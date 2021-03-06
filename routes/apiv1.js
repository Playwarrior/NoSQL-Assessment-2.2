const express = require('express');
const router = express.Router();

const assert = require('assert');
const jwt = require('../helpers/jwt');

const commentRoute = require('./apiv1/commentroute');
const userRoute = require('./apiv1/userroute');
const threadRoute = require('./apiv1/threadroute');
const friendshipRoute = require('./apiv1/friendshipRoute');

router.all('*', (req, res, next) => {
	assert(typeof req.headers['token'] === 'string', 'No valid token!');

	const token = req.header('token') || '';

	jwt.decodeToken(token, (error, payload) => {
		if (error) {
			res.status(401).json({ message: 'Not authorized / authenticated!', error: error });
		} else {
			res.set('id', payload.sub);
			next();
		}
	});
});

router.use('/threads', threadRoute);
router.use('/users', userRoute);
router.use('/comments', commentRoute);
router.use('/friendships', friendshipRoute);

module.exports = router;
