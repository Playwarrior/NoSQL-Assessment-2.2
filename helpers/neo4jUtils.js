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
	neo4j.auth.basic(connection.neo4j.username, connection.neo4j.password),
	{ encrypted: connection.neo4j.encrypted }
);

const session = driver.session();

console.log(session);

// Create a User in Neo4j DB
// CONSTAINT created in DB to prevent duplicates.
// exports.CreateUser = async function(userName) {
// 	session
// 		.run(`CREATE (a:User {username: "${userName}"}) return a`)
// 		.then((result) => {
// 			console.log(result);
// 			session.close();
// 			return result;
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			session.close();
// 			return new Error(error);
// 		});
// };

// // Delete a User and his friendships in Neo4j DB
// exports.DeleteUser = function(userName) {
// 	session
// 		.run(`MATCH (u:User {username: "${userName}"})-[r:FRIENDED]-(:User) DELETE r, u;`) // Delete all friendships and then User
// 		.then(() => {
// 			return true;
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			return false;
// 		});
// 	session.close();
// };

// // Create a friendship relation between two Users in Neo4j DB
// exports.CreateFriends = function(firstUserName, secondUserName) {
// 	session
// 		.run(
// 			`MATCH (a:User {username: "${usernameFirst}"}), (b:User {username: "${usernameSecond}"}) MERGE (a)-[:FRIENDED]->(b) RETURN a.username, b.username;`
// 		)
// 		.then((result) => {
// 			console.log(result);
// 			if (result.records[0].get(0)) {
// 				logger.log(
// 					`Friend relation between user ${firstUserName} and user ${secondUserName} created in Neo4j database.`
// 				);
// 				return true;
// 			}
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			return false;
// 		});
// 	session.close();
// };

// // Get all friendship relations of a User in Neo4j DB
// exports.GetAllFriendshipsFromUser = function(userName, lengthOfRelations) {
// 	// Check if length is greater than 1
// 	const getLength = lengthOfRelations == null ? 0 : lengthOfRelations;

// 	getLength = lengthOfRelations < 1 ? 1 : lengthOfRelations;

// 	session
// 		.run(`MATCH (a:User {username: ${userName}})-[r*1..${getLength}]-(b) return b;`)
// 		.then((result) => {
// 			console.log(result);
// 			return result;
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			return error;
// 		});
// 	session.close();
// };

// // Check if a friendship relation between two Users exists in Neo4j DB
// exports.CheckIfFriendshipExists = function(firstUserName, secondUserName) {
// 	session
// 		.run(
// 			`MATCH (a:User), (b:User) WHERE a.username = "${firstUserName}" AND b.username = "${secondUserName}" RETURN EXISTS( (a)-[:FRIENDED]-(b));`,
// 			console.log(session)
// 		)
// 		.then((result) => {
// 			console.log(result);
// 			if (result.records[0].get(0)) {
// 				return true;
// 			}
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			return false;
// 		});

// 	session.close();
// };

// exports.RemoveFriendship = function(firstUserName, secondUserName) {
// 	session
// 		.run(
// 			`MATCH (a:User {username: "${firstUserName}"})-[r:FRIENDED]-(:User {username: "${secondUserName}"}) DELETE r RETURN a;`
// 		)
// 		.then((result) => {
// 			return result.records;
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			return false;
// 		});
// 	session.close();
// };

// exports.RemoveAllFriendships = function(userName) {
// 	session
// 		.run(`MATCH (a:User {username: "${userName}")-[r:FRIENDED]-(:User) DELETE r RETURN a;`)
// 		.then((result) => {
// 			return result.records;
// 		})
// 		.catch((error) => {
// 			console.log(error);
// 			// return error;
// 			return false;
// 		});
// 	session.close();
// };

module.exports = session;
