const mongoose = require('mongoose');
const app = require('../app');
const session = require('../helpers/neo4jUtils');

before((done) => {
	mongoose.connect('mongodb://localhost:27017/studdit_test');
	mongoose.connection.once('open', () => done()).on('error', (error) => console.warn('Warning', error));
});

beforeEach((done) => {
	const { users, threads, comments } = mongoose.connection.collections;

	Promise.all([ users.drop(), threads.drop(), comments.drop() ])
		.then(() => {
			session.run('MATCH (n) DETACH DELETE n;').then(() => done());
		})
		.catch(() => done());
});
