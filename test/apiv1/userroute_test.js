const mongoose = require('mongoose');
const assert = require('assert');
const request = require('supertest');

const User = require('../../models/user');

const app = require('../../app');

describe('User route', (done) => {
	let username = 'xXx_SniperWolf_xXx';
	let password = 'EXPOSED!';

	let token;

	before((done) => {
		request(app)
			.post('/auth/register')
			.send({
				userName: username,
				password: password
			})
			.end(() => {
				request(app)
					.post('/auth/login')
					.send({
						userName: username,
						password: password
					})
					.end((err, response) => {
						token = response.body.token;
						done();
					});
			});
	});

	it('Get user information using /apiv1/users', (done) => {
		request(app).get('/apiv1/users').set('token', token).expect(200).end((err, response) => {
			assert(response.body.userName !== null);
			assert(response.body.registerDate !== null);
			done();
		});
	});

	it('Get Comments by userId using /apiv1/users/comments', (done) => {
		request(app).get('/apiv1/users/comments').set('token', token).expect(200).end((err, response) => {
			assert(response.body.length === 0);
			done();
		});
	});

	it('Get Comments by userId using /apiv1/users/threads', (done) => {
		request(app).get('/apiv1/users/threads').set('token', token).expect(200).end((err, response) => {
			assert(response.body.length === 0);
			done();
		});
	});

	it('Delete a User by userId using /apiv1/users', (done) => {
		request(app)
			.delete('/apiv1/users')
			.set('token', token)
			.send({ password: password })
			.expect(200)
			.end((err, response) => {
				User.findOne({ userName: username }).then((user) => {
					assert(user === null);
					done();
				});
			});
	});
});
