const express = require('express');
const router = express.Router();

const User = require('../../models/user');
const Comment = require('../../models/comment');
const Thread = require('../../models/thread');

router.get('', (req, res, next) => {
    User.findOne({_id: res.get('id')}, {registerDate: 1, userName: 1}).then((user) => {
        res.status(200).json(user);
    }).catch((error) => {
        next(error);
    });
});

router.get('/comments', (req, res, next) => {
    Comment.find({userId: res.get('id')}).then((comments) => {
        res.status(200).json(comments);
    }).catch((error) => {
        next(error);
    });
});

router.get('/threads', (req, res, next) => {
    Thread.find({userId: res.get('id')}).then((threads) => {
        res.status(200).json(threads);
    }).catch((error) => {
        next(error);
    });
});

router.delete('', (req, res, next) => {
    User.findByIdAndRemove(res.get('id')).then(() => {
        res.status(200).json('user deleted!');
    }).catch((error) => {
        next(error);
    });
});

module.exports = router;
