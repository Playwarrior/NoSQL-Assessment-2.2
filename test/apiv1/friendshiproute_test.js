const assert = require('assert');
const request = require('supertest');

const app = require('../../app');

const session = require('../../helpers/neo4jUtils');

describe('Friendship route', () => {
	let usernameA = 'DerEchteAnton';
	let passwordA = 'BratWurst123';

	let usernameB = 'VaderJacob';
	let passwordB = 'BestPassword123';

	let token;

	before((done) => {
		request(app)
			.post('/auth/register')
			.send({
				userName: usernameA,
				password: passwordA
			})
			.end((err, response) => {
				request(app)
					.post('/auth/register')
					.send({
						userName: usernameB,
						password: passwordB
					})
					.end((err, response) => {
						request(app)
							.post('/auth/login')
							.send({
								userName: usernameA,
								password: passwordA
							})
							.end((err, response) => {
								token = response.body.token;

								request(app)
									.post('/apiv1/friendships')
									.set('token', token)
									.send({ firstUsername: usernameA, secondUsername: usernameB })
									.end((err, response) => {
										done();
									});
							});
					});
			});
	});

	it('can post a new friendship relation between two users using /apiv1/friendships', (done) => {
		request(app)
			.post('/apiv1/friendships')
			.set('token', token)
			.send({ firstUsername: usernameA, secondUsername: usernameB })
			.expect(200)
			.end((err, response) => {
				session
					.run(
						`MATCH (a:User {username: "${usernameA}"})-[r:FRIENDED]->(b:User {username: "${usernameB}"}) RETURN true;`
					)
					.then((result) => {
						const friendshipIsCreated = result.records[0]._fields[0];
						assert(friendshipIsCreated === true);
						done();
					});
			});
	});

	it('Can get all friendship relations using /apiv1/friendships', (done) => {
		request(app)
			.get('/apiv1/friendships')
			.set('token', token)
			.send({ length: 1 })
			.expect(200)
			.end((err, response) => {
				const responseFriendsArrayCount = response.body.result.length;
				assert(responseFriendsArrayCount > 0);
				assert(responseFriendsArrayCount !== 0);
				done();
			});
	});

	it('can check if friendship relation between two users exists', (done) => {
		request(app)
			.get('/apiv1/friendships/check')
			.set('token', token)
			.send({
				firstUsername: usernameA,
				secondUsername: usernameB
			})
			.expect(200)
			.end((err, response) => {
				const friendshipDoesExists = response.body.result;
				assert(friendshipDoesExists === true);
				done();
			});
	});

	it('can delete a friendship relation between two users using apiv1/friendships', (done) => {
		request(app)
			.delete('/apiv1/friendships')
			.set('token', token)
			.send({
				firstUsername: usernameA,
				secondUsername: usernameB
			})
			.expect(200)
			.end((err, response) => {
				session
					.run(`MATCH (a:User {username: "${usernameA}"})-[r:FRIENDED]-(b:User) return collect(b.username);`)
					.then((result) => {
						const resultArray = result.records[0]._fields[0];
						assert(resultArray.indexOf(usernameB) === -1);
						done();
					});
			});
	});
});
