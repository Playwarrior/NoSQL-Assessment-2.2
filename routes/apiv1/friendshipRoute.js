const express = require('express');
const router = express.Router();

const assert = require('assert');

const logger = require('tracer').dailyfile({
	root: './logs',
	maxLogFiles: 10,
	allLogsFileName: 'studdit-app',
	format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
	dateformat: 'HH:MM:ss.L'
});

const session = require('../../helpers/neo4jUtils');

// POST: create friendship between two Users
router.post('/', (req, res, next) => {
	try {
		const usernameFirst = req.body.firstUsername;
		const usernameSecond = req.body.secondUsername;

		assert(typeof usernameFirst === 'string', 'usernameFirst is not a string!');
		assert(typeof usernameSecond === 'string', 'usernameSecond is not a string!');

		session
			.run(
				`MATCH (a:User {username: "${usernameFirst}"}), (b:User {username: "${usernameSecond}"}) MERGE (a)-[:FRIENDED]->(b) RETURN a.username, b.username;`
			)
			.then((result) => {
				const r = result.records[0]._fields;
				res.status(200).json({
					message: `Friendship between ${usernameFirst} and ${usernameSecond} succesfully created`,
					result: r
				});
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to create friendship`, error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
	session.close();
});

// GET: check if two users are friended, return boolean
router.get('/check', (req, res, next) => {
	try {
		const usernameFirst = req.body.firstUsername;
		const usernameSecond = req.body.secondUsername;

		assert(typeof usernameFirst === 'string', 'firstUsername is not a string');
		assert(typeof usernameSecond === 'string', 'secondUsername is not a string');

		session
			.run(
				`MATCH (a:User), (b:User) WHERE a.username = "${usernameFirst}" AND b.username = "${usernameSecond}" RETURN EXISTS( (a)-[:FRIENDED]-(b));`
			)
			.then((result) => {
				const r = result.records[0]._fields[0];
				res.status(200).json({
					message: `Friendship relation between ${usernameFirst} and ${usernameSecond} exists!`,
					result: r
				});
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to find any friendship relation`, error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}

	session.close();
});

// GET: show all friendship relation of user and/or his/her friends friendship relations
router.get('/', (req, res, next) => {
	try {
		assert(typeof req.body.length === 'number', 'length is not a number!');

		const userId = res.get('id');
		const getLength = req.body.length;

		if (req.body.length < 1) {
			getLength = 1;
		}

		session
			.run(`MATCH (a:User {userId: "${userId}"})-[r*1..${getLength}]-(b) return collect(DISTINCT b.username);`)
			.then((result) => {
				const values = result.records[0]._fields[0];

				res.status(200).json({ message: `User with userId ${userId} relationships`, result: values });
			})
			.catch((error) => {
				console.log(error);
				res.status(500).json({ message: `Unable to find any friendship relation`, error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
	session.close();
});

// DELETE: Remove a friendship relation
router.delete('/', (req, res, next) => {
	try {
		const usernameFirst = req.body.firstUsername;
		const usernameSecond = req.body.secondUsername;

		assert(typeof usernameFirst === 'string', 'usernameFirst is not a string!');
		assert(typeof usernameSecond === 'string', 'usernameSecond is not a string!');

		session
			.run(
				`MATCH (a:User {username: "${usernameFirst}"})-[r:FRIENDED]-(:User {username: "${usernameSecond}"}) DELETE r RETURN true;`
			)
			.then((result) => {
				const r = result.records[0]._fields[0];
				res.status(200).json({
					message: `Friendship relation between ${usernameFirst} and ${usernameSecond} succesfully deleted!`,
					result: r
				});
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to find any friendship relation`, error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
});

// DELETE: Delete all User's friendship relations
router.delete('/users', (req, res, next) => {
	try {
		const id = res.get('id');

		session
			.run(`MATCH (:User {userId: "${id}"})-[r:FRIENDED]-(:User) DELETE r;`)
			.then(() => {
				res.status(200).json({ message: `User ${id} friendship relations succesfully deleted!` });
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to find user`, error: error });
			});
	} catch (ex) {
		console.log(ex);
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
	session.close();
});

module.exports = router;
