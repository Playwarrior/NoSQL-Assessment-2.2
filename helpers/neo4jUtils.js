const neo4j = require('neo4j-driver').v1;

const logger = require('tracer').dailyfile({
	root: './logs',
	maxLogFiles: 10,
	allLogsFileName: 'studdit-app',
	format: '{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})',
	dateformat: 'HH:MM:ss.L'
});

const connection = require('../connection.json');

// NEO4J CLOUD DB CONNECTION
const driver = neo4j.driver(
	connection.neo4j.connectionString,
	neo4j.auth.basic(connection.neo4j.username, connection.neo4j.password)
);

// Create a User in Neo4j DB
export function CreateUser(userName) {
	session
		.run(`CREATE (a:User {username: $username}) return a`, { username: userName })
		.then((result) => {
			console.log(result);
			if (result.records[0].get('username') === userName) {
				logger.log(`User ${userName} succesfully created in Neo4j database.`);
				return true;
			}
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});

	session.close();
}

// Delete a User and his friendships in Neo4j DB
export function DeleteUser(userName) {
	session
		.run(`MATCH (u:User {username: "Henk"})-[r:FRIENDED]-(:User) DELETE r, u;`, { username: userName }) // Delete all friendships and then user
		.then(() => {
			return true;
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});
	session.close();
}

// Create a friendship relation between two Users in Neo4j DB
export function CreateFriends(firstUserName, secondUserName) {
	session
		.run(
			`MATCH (a:User), (b:User) WHERE a.username = $usernameA AND b.username = $usernameB CREATE (a)-[FRIENDED]->(b) return true;`,
			{ usernameA: firstUserName, usernameB: secondUserName }
		)
		.then((result) => {
			console.log(result);
			if (result.records[0].get(0)) {
				logger.log(
					`Friend relation between user ${firstUserName} and user ${secondUserName} created in Neo4j database.`
				);
				return true;
			}
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});
	session.close();
}

// Get all friendship relations of a User in Neo4j DB
export function GetAllConnectionFriendshipsFromUser(userName, lengthOfRelations) {
	// Check if length is greater than 1
	const getLength = lengthOfRelations < 1 ? 1 : lengthOfRelations;

	session
		.run(`MATCH (a:User {username: $username})-[r*1..$length]-(b) return b;`, {
			username: userName,
			length: getLength
		})
		.then((result) => {
			console.log(result);
			return result;
		})
		.catch((error) => {
			console.log(error);
			return error;
		});
	session.close();
}

// Check if a friendship relation between two Users exists in Neo4j DB
export function CheckIfFriendshipExists(firstUserName, secondUserName) {
	session
		.run(
			`MATCH (a:User), (b:User) WHERE a.username = $usernameA AND b.username = $usernameB RETURN EXISTS( (a)-[:FRIENDED]-(b));`,
			{ usernameA: firstUserName, usernameB: secondUserName }
		)
		.then((result) => {
			if (result.records[0].get(0)) {
				return true;
			}
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});

	session.close();
}

// Remove friendship relation between two Users in Neo4j DB
export function RemoveFriendship(firstUserName, secondUserName) {
	session
		.run(`MATCH (:User {username: $usernameA})-[r:FRIENDED]-(:User {username: $usernameB}) DELETE r return true;`, {
			usernameA: firstUserName,
			usernameB: secondUserName
		})
		.then(() => {
			return true;
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});
	session.close();
}

// Remove all friendship relations of a User in Neo4j DB
export function RemoveAllFriendships(userName) {
	session
		.run(`MATCH (:User {username: $username})-[r:FRIENDED]-(:User) DELETE r;`, { username: userName })
		.then(() => {
			return true;
		})
		.catch((error) => {
			console.log(error);
			// return error;
			return false;
		});
	session.close();
}
