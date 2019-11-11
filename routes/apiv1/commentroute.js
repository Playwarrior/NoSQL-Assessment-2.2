const express = require('express');
const router = express.Router();

const Comment = require('../../models/comment');

router.get('', (req, res, next) => {
    Comment.find({}).then((comments) => {
        res.status(200).json(comments);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id', (req, res, next) => {
    Comment.findOne({_id: req.params.id}).then((comment) => {
        res.status(200).json(comment);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id/votes', (req, res, next) => {
    let upvote = req.query.vote;

    //TODO

    upvote = upvote !== undefined ? upvote !== 0 : true;

    Comment.find({_id: req.params.id}, {
        votesOfUsers: 1
    }).populate({
        path: 'userId',
        model: 'user'
    }).then((objects) => {
        res.status(200).json(objects);
    }).catch((error) => {
        next(error);
    });
});


module.exports = router;
