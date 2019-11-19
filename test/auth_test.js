const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app');

const User = mongoose.model('user');

describe('Authorisation tests', () => {

    let username = "Pussydestroyer69";
    let password = "Je-Moeder-69";

    it('Creation of user using /auth/register', (done) => {
        request(app)
            .post('/auth/register')
            .send({
                userName: username,
                password: password
            })
            .end(() => {
                User.findOne({userName: username})
                    .then((user) => {
                        assert(user !== null);
                        done();
                    });
            });
    });

    it('Logging in of a user using /auth/login', (done) => {
        request(app)
            .post('/auth/login')
            .send({
                userName: username,
                password: password
            }).end((err, response) => {
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
                userName: username,
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
