const mongoose = require('mongoose');
const assert = require('assert');
const request = require('supertest');

const User = require('../../models/user');
const Thread = require('../../models/thread');
const Comment = require('../../models/comment');

const app = require('../../app');

describe('Thread route tests', () => {
    let username = 'WowCoolUsername';
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

    let t, c;

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
                        request(app)
                            .post(`/apiv1/threads/${t._id}/comment`)
                            .set('token', token)
                            .expect(200)
                            .send({
                                content: 'No just no....'
                            })
                            .end((err, response) => {
                                Comment.findOne({threadId: t._id, content: 'No just no....'}).then((comment) => {
                                    c = comment;
                                    done();
                                });
                            });
                    });
            });
    });

    it('Getting all comments using /apiv1/comments', (done) => {
        request(app)
            .get('/apiv1/comments')
            .set('token', token)
            .expect(200)
            .end((err, response) => {
                Comment.find().then((comments) => {
                    assert(comments.length > 0);
                    done();
                })
            });
    });

    it('Upvoting of a comment using /apiv1/comments/:id/upvote', (done) => {
        request(app)
            .put(`/apiv1/comments/${c._id}/upvote`)
            .set('token', token)
            .expect(200)
            .end(() => {
                Comment.findById(c._id).then((comment) => {
                    assert(comment.votesOfUsers.downVotes.length === 0);
                    assert(comment.votesOfUsers.upVotes.length === 1);
                    done();
                });
            });
    });

    it('Downvoting of a comment using /apiv1/comments/:id/downvote', (done) => {
        request(app)
            .put(`/apiv1/comments/${c._id}/downvote`)
            .set('token', token)
            .expect(200)
            .end(() => {
                Comment.findById(c._id).then((comment) => {
                    assert(comment.votesOfUsers.downVotes.length === 1);
                    assert(comment.votesOfUsers.upVotes.length === 0);
                    done();
                });
            });
    });

    it('Updating a comment using /apiv1/comments/:id', (done) => {
        request(app)
            .put(`/apiv1/comments/${c._id}`)
            .set('token', token)
            .expect(200)
            .send({
                content: 'Ohw broeder!'
            })
            .end(() => {
                Comment.findOne({content: 'Ohw broeder!'}).then((comment) => {
                    assert(comment !== null);
                    done();
                });
            });
    });

    it('Creation of a comment on a comment using /apiv1/threads/:id/comment/:comment', (done) => {
        request(app)
            .post(`/apiv1/threads/${t._id}/comment/${c._id}`)
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

    it('Deletion of a comment using /apiv1/threads/:id', (done) => {
        request(app)
            .delete(`/apiv1/comments/${c._id}`)
            .set('token', token)
            .expect(200)
            .end((err, response) => {
               Comment.findOne({content: 'No just no....'}).then((comment) => {
                   assert(comment === null);
                   done();
               });
            });
    });
});
