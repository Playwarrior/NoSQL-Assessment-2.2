const neo4j = require('neo4j-driver').v1;

const connection = require('../connection.json');

const isTesting = connection.testing;

let connectionString = '';
let username = '';
let password = '';

// Check if config is set to testing, then use the suited config
if (!isTesting) {
	connectionString = connection.neo4j.connectionString;
	username = connection.neo4j.username;
	password = connection.neo4j.password;
} else {
	connectionString = connection.neo4jTest.connectionString;
	username = connection.neo4jTest.username;
	password = connection.neo4jTest.password;
}

// NEO4J CLOUD DB CONNECTION
const driver = neo4j.driver(connectionString, neo4j.auth.basic(username, password), {
	encrypted: connection.encryptedConnection
});

const session = driver.session();

module.exports = session;
