const express = require('express');
const router = express.Router();

const assert = require('assert');

const Comment = require('../../models/comment');

//TODO: ADD AUTHORISATION!

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
        assert(req.params.id.length === 19, 'Invalid id');

        Comment.findByIdAndUpdate(req.params.id, {
            content: req.body.content
        }).then(() => {
            res.status(200).json('Comment has been updated!');
        }).catch((error) => {
            next(error);
        })
    } catch (ex) {
        next(ex);
    }
});

router.put('/:id/upvote', (req, res, next) => {
    try {
        assert(req.params.length === 19, 'Invalid id');

        Comment.findById(req.params.id).then((comment) => {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            upVotes.push(res.get('id'));
            downVotes.remove(res.get('id'));

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
        assert(req.params.length === 19, 'Invalid id');

        Comment.findById(req.params.id).then((comment) => {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            upVotes.remove(res.get('id'));
            downVotes.push(res.get('id'));

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
        assert(req.params.id.length === 19, 'Invalid id');

        Comment.findByIdAndRemove(req.params.id).then(() => {
            res.status(204).json('Comment deleted!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});


module.exports = router;
