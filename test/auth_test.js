const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app');

const User = mongoose.model('user');

const session = require('../helpers/neo4jUtils');

describe.only('Authorisation tests', () => {
	let username = 'Pussydestroyer69';
	let password = 'Je-Moeder-69';

	it('Creation of user using /auth/register', (done) => {
		request(app)
			.post('/auth/register')
			.send({
				userName: username,
				password: password
			})
			.end(() => {
				User.findOne({ userName: username })
					.then((user) => {
						assert(user !== null);
					})
					.then(() => {
						session.run(`MATCH (u:User {username: "${username}"}) RETURN u.username;`).then((user) => {
							const usernameResult = user.records[0]._fields[0];
							assert(usernameResult === username);
							done();
						});
					});
			});
	});

	it('Logging in of a user using /auth/login', (done) => {
		request(app)
			.post('/auth/login')
			.send({
				userName: username,
				password: password
			})
			.end((err, response) => {
				assert(response.body.description !== null);
				assert(response.body.token !== null);
				done();
			});
	});

	it('Changing a password of a user /auth/register', (done) => {
		let newPassword = 'NewMuchCoolerPassword';

		request(app)
			.put('/auth/register')
			.send({
				username: username,
				password: password,
				newPassword: newPassword
			})
			.end(() => {
				request(app)
					.post('/auth/login')
					.send({
						userName: username,
						password: newPassword
					})
					.end((err, response) => {
						assert(response.body.description !== null);
						assert(response.body.token !== null);
						done();
					});
			});
	});
});
