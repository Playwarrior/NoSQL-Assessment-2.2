const mongoose = require('mongoose');

before((done) => {
    mongoose.connect('mongodb://localhost/studdit_test');
    mongoose.connection.once('open', () => done())
        .on('error', (error) => console.warn('Warning', error));
});

beforeEach((done) => {
    const {users, threads, comments} = mongoose.connection.collections;

    Promise.all([users.drop(), threads.drop(), comments.drop()])
        .then(() => done())
        .catch(() => done());
});
