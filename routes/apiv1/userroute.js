const express = require('express');
const router = express.Router();

const User = require('../../models/user');
const Comment = require('../../models/comment');
const Thread = require('../../models/thread');

router.get('', (req, res, next) => {
    User.find().then((users) => {
        res.status(200).json(users);
    }).catch((error) => {
       next(error);
    });
});

router.get('/:id', (req, res, next) => {
   User.findOne({_id: req.params.id}).then((user) => {
       res.status(200).json(user);
   }).catch((error) => {
      next(error);
   });
});

router.get('/:id/comments', (req, res, next) => {
   Comment.find({userId: req.params.id}).then((comments) => {
       res.status(200).json(comments);
   }).catch((error) => {
       next(error);
   });
});

router.get('/:id/threads', (req, res, next) => {
    Thread.find({userId: req.params.id}).then((threads) => {
        res.status(200).json(threads);
    }).catch((error) => {
       next(error);
    });
});

module.exports = router;
