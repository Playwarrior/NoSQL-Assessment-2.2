const express = require('express');
const router = express.Router();

const assert = require('assert');

const neo4j = require('../../helpers/neo4jUtils');

const User = require('../../models/user');

router.post('/', (req, res, next) => {
	const b = req.body;
	const usernameFirst = b.firstUsername;
	const usernameSecond = b.secondUsername;

	assert(usernameFirst === String, 'usernameFirst is not a string!');
	assert(usernameSecond === String, 'usernameSecond is not a string!');

	const result = neo4j.CreateFriends(usernameFirst, usernameSecond);

	if (!result) {
		res
			.status(200)
			.json({ message: `Friendship between ${usernameFirst} and ${usernameSecond} succesfully created!` });
	}
});
