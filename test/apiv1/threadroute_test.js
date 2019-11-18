const mongoose = require('mongoose');
const assert = require('assert');
const request = require('supertest');

const User = require('../../models/user');
const Thread = require('../../models/thread');
const Comment = require('../../models/comment');

const app = require('../../app');

describe('Thread route tests', () => {
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

    let t;

    beforeEach((done) => {
        request(app)
            .post('/apiv1/threads')
            .set('token', token)
            .expect(200)
            .send({
                title: 'This is a thread!',
                content: 'Hold up....'
            })
            .end((err, response) => {
                Thread.findOne({title: 'This is a thread!', content: 'Hold up....'})
                    .then((thread) => {
                        t = thread;
                        done();
                    });
            });
    });

    it('Creation of a new thread using /apiv1/threads', (done) => {
        request(app)
            .post('/apiv1/threads')
            .set('token', token)
            .expect(200)
            .send({
                title: 'This is a thread!',
                content: 'Hold up.'
            })
            .end((err, response) => {
                Thread.findOne({title: 'This is a thread!', content: 'Hold up.'})
                    .then((thread) => {
                        assert(thread !== null);
                        done();
                    });
            });
    });

    it('Creation of a comment on a thread using /apiv1/threads/:id/comment', (done) => {
        request(app)
            .post(`/apiv1/threads/${t._id}/comment`)
            .set('token', token)
            .expect(200)
            .send({
                content: 'No just no...'
            })
            .end((err, response) => {
                Comment.findOne({threadId: t._id, content: 'No just no...'}).then((comment) => {
                    assert(comment !== null);
                    done();
                });
            });
    });

    it('Upvoting of a thread using /apiv1/threads/:id/upvote', (done) => {
        request(app)
            .put(`/apiv1/threads/${t._id}/upvote`)
            .set('token', token)
            .expect(200)
            .end(() => {
                Thread.findById(t._id).then((thread) => {
                    assert(thread.votesOfUsers.downVotes.length === 0);
                    assert(thread.votesOfUsers.upVotes.length === 1);
                    done();
                });
            });
    });

    it('Downvoting of a thread using /apiv1/threads/:id/downvote', (done) => {
        request(app)
            .put(`/apiv1/threads/${t._id}/downvote`)
            .set('token', token)
            .expect(200)
            .end(() => {
                Thread.findById(t._id).then((thread) => {
                    assert(thread.votesOfUsers.downVotes.length === 1);
                    assert(thread.votesOfUsers.upVotes.length === 0);
                    done();
                });
            });
    });

    it('Getting a thread with a specific id using /apiv1/threads/:id', (done) => {
        request(app)
            .get(`/apiv1/threads/${t._id}`)
            .set('token', token)
            .expect(200)
            .end((err, response) => {
                assert(response.body.thread.title === t.title);
                assert(response.body.thread.content === t.content);
                done();
            });
    });

    it('Updating a thread with a specific id using /apiv1/threads/:id', (done) => {
        request(app)
            .put(`/apiv1/threads/${t._id}`)
            .set('token', token)
            .expect(200)
            .send({
                content: 'A new thread? Wow!'
            })
            .end((err, response) => {
                Thread.findOne({_id: t._id}).then((thread) => {
                    assert(thread !== null);
                    assert(thread.content === 'A new thread? Wow!');
                    done();
                });
            });
    });

    it('Deleting a thread with a specific id using /apiv1/threads/:id', (done) => {
        request(app)
            .delete(`/apiv1/threads/${t._id}`)
            .set('token', token)
            .expect(200)
            .end((err, response) => {
                Thread.find({_id: t._id}).then((threads) => {
                    assert(threads.length === 0);
                    done();
                })
            });
    });
});
