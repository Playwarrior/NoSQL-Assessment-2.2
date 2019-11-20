const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const NullSector = require('../../util/nullsector');
const Comment = require('../../models/comment');

router.post('/:id', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id}, (error, bool, c) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else {
            const comment = new Comment({
                userId: res.get('id'),
                commentId: c._id,
                threadId: c.threadId,
                content: req.body.content
            });

            comment.save().then(() => {
                res.status(200).json('Comment created!');
            }).catch((error) => {
                next(error);
            });
        }
    });
});

router.get('', (req, res, next) => {
    Comment.find({}).then((comments) => {
        res.status(200).json(comments);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id}, (error, bool, comment) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else
            res.status(200).json(comment);
    });
});

router.put('/:id', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id, userId: res.get('id')}, (error, bool, comment) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else {
            comment.update({content: req.body.content}).then(() => {
                res.status(200).json('Comment updated!');
            }).catch((error) => {
                next(error);
            });
        }
    });
});

router.put('/:id/upvote', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id}, (error, bool, comment) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            if (!upVotes.includes(res.get('id'))) {
                upVotes.push(res.get('id'));
                downVotes.remove(res.get('id'));
            }

            comment.update({
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Upvoted comment!');
            }).catch((error) => {
                next(error);
            });
        }
    });
});

router.put('/:id/downvote', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id}, (error, bool, comment) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else {
            let upVotes = comment.votesOfUsers.upVotes;
            let downVotes = comment.votesOfUsers.downVotes;

            if (!downVotes.includes(res.get('id'))) {
                upVotes.remove(res.get('id'));
                downVotes.push(res.get('id'));
            }

            comment.update({
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Downvoted comment!');
            }).catch((error) => {
                next(error);
            });
        }
    });
});

router.delete('/:id', (req, res, next) => {
    NullSector.hasComment({_id: req.params.id, userId: res.get('id')}, (error, bool, comment) => {
        if (error)
            next(error);

        else if (!bool)
            res.status(204).json('No comment found with Id: ' + req.params.id);

        else {
            comment.remove().then(() => {
                res.status(200).json('Comment deleted!');
            }).catch((error) => {
                next(error);
            })
        }
    });
});

module.exports = router;
