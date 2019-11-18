const express = require('express');
const router = express.Router();

const assert = require('assert');

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

router.put('/:id', (req, res, next) => {
    try {
        Comment.findOneAndUpdate({_id: req.params.id, userId: res.get('id')}, {
            content: req.body.content
        }).then(() => {
            //TODO: ADD MESSAGE IF COMMENT HAS NOT BEEN UPDATED!
            res.status(200).json('Comment has been updated!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

router.put('/:id/upvote', (req, res, next) => {
    try {
        Comment.findById(req.params.id).then((comment) => {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            if (!upVotes.includes(res.get('id'))) {
                upVotes.push(res.get('id'));
                downVotes.remove(res.get('id'));
            }

            Comment.findByIdAndUpdate(req.params.id, {
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Upvoted comment!');
            });
        });
    } catch (ex) {
        next(ex);
    }
});

router.put('/:id/downvote', (req, res, next) => {
    try {
        Comment.findById(req.params.id).then((comment) => {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            if (!downVotes.includes(res.get('id'))) {
                upVotes.remove(res.get('id'));
                downVotes.push(res.get('id'));
            }

            Comment.findByIdAndUpdate(req.params.id, {
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Upvoted thread!');
            });
        });
    } catch (ex) {
        next(ex);
    }
});

router.delete('/:id', (req, res, next) => {
    try {
        Comment.findOneAndRemove({_id: req.params.id, userId: res.get('id')}).then((comment) => {
            if (comment === null)
                res.status(401).json('Unauthorized deletion');

            else
                res.status(204).json('Comment deleted!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
