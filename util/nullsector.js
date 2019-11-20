const Comment = require('../models/comment');
const Thread = require('../models/thread');

function hasThread(searchCriteria, cb) {
    Thread.findOne(searchCriteria).then((thread) => {
        cb(null, thread !== null, thread);
    }).catch((error) => {
        cb(error, false, null);
    })
}

function hasComment(searchCriteria, cb) {
    Comment.findOne(searchCriteria).then((comment) => {
        cb(null, comment !== null, comment);
    }).catch((error) => {
        cb(error, false, null);
    });
}

module.exports = {
    hasThread,
    hasComment
};
