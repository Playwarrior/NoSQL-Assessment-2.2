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

/**
 * TODO: add post User for neo4j DB to actual userroute
 * TODO: add delete User for neo4j DB to actual userroute
 */

// POST: add User to neo4j DB
router.post('/users', (req, res, next) => {
	try {
		const userName = req.body.userName;

		assert(typeof userName === 'string', 'userName is not a string!');

		session
			.run(`CREATE (a:User {username: "${userName}"}) return a`)
			.then((result) => {
				const r = result.records[0]._fields[0].properties.username;
				session.close();

				res.status(200).json({ message: `User ${userName} succesfully created`, username: r });
			})
			.catch((error) => {
				res.status(500).json({ message: 'Could not create user!', error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
	session.close();
});

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
		const userName = req.body.userName;
		const getLength = req.body.length < 1 ? 1 : req.body.length;

		assert(typeof userName === 'string', 'userName is not a string!');
		assert(typeof getLength === 'number', 'length is not a number!');

		session
			.run(
				`MATCH (a:User {username: "${userName}"})-[r*1..${getLength}]-(b) return collect(DISTINCT b.username);`
			)
			.then((result) => {
				const values = result.records[0]._fields[0];

				res.status(200).json({ message: `User ${userName} relationships`, result: values });
			})
			.catch((error) => {
				res.status(500).json({ message: `Unable to find any friendship relation`, error: error });
			});
	} catch (ex) {
		res.status(500).json({ message: `An exception has occurred!`, exception: ex });
	}
	session.close();
});

// DELETE: Remove a friendship
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

// DELETE: Delete User and all its friendship relations
router.delete('/users', (req, res, next) => {
	try {
		const userName = req.body.userName;

		assert(typeof userName === 'string', 'userName is not a string!');

		// First delete all friendship relation
		session
			.run(`MATCH (:User {username: "${userName}"})-[r:FRIENDED]-(:User) DELETE r;`)
			.catch((error) => {
				res.status(500).json({ message: `Unable to find user`, error: error });
			})
			.then(() => {
				// Then delete User
				session.run(`MATCH (u:User {username: "${userName}"}) DELETE u;`).catch((error) => {
					res.status(500).json({ message: `Unable to find user`, error: error });
				});
			})
			.then(() => {
				res.status(200).json({ message: `User ${userName} succesfully deleted!` });
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
