const express = require('express');
const router = express.Router();

const assert = require('assert');

const Thread = require('../../models/thread');
const Comment = require('../../models/comment');

//TODO: MAYBE ADD AUTHORISATION TO DETERMINE IF THE USER CAN EDIT / DELETE THE COMMENT!

router.post('', (req, res, next) => {
    try {
        const thread = new Thread({
            userId: res.get('id'),
            title: req.body.title,
            content: req.body.content
        });

        thread.save().then(() => {
            res.status(200).json('Thread created');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

router.post('/:id/comment', (req, res, next) => {
    try {
        assert(req.params.id.length === 19, 'Invalid id');

        const comment = new Comment({
            userId: res.get('id'),
            threadId: req.params.id,
            content: req.body.content
        });

        comment.save().then(() => {
            res.status(200).json('Comment created!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

router.post('/:id/comment/:comment', (req, res, next) => {
    try {
        assert(req.params.id.length === 19, 'Invalid id');
        assert(req.params.comment.length === 19, 'Invalid comment Id');

        const comment = new Comment({
            userId: res.get('id'),
            commentId: req.params.comment,
            threadId: req.params.id,
            content: req.body.content
        });

        comment.save().then(() => {
            res.status(200).json('Comment created!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

router.put('/:id/upvote', (req, res, next) => {
    try {
        assert(req.params.length === 19, 'Invalid id');

        Thread.findById(req.params.id).then((thread) => {
            let upVotes = thread.votesOfUsers.upVotes;
            let downVotes = thread.votesOfUsers.downVotes;

            upVotes.push(res.get('id'));
            downVotes.remove(res.get('id'));

            Thread.findByIdAndUpdate(req.params.id, {
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

router.put('/:id/downvote', (req, res, next) => {
    try {
        assert(req.params.length === 19, 'Invalid id');

        Thread.findById(req.params.id).then((thread) => {
            let upVotes = thread.votesOfUsers.upVotes;
            let downVotes = thread.votesOfUsers.downVotes;

            upVotes.remove(res.get('id'));
            downVotes.push(res.get('id'));

            Thread.findByIdAndUpdate(req.params.id, {
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Downvoted thread!');
            });
        });
    } catch (ex) {
        next(ex);
    }
});

router.get('', (req, res, next) => {
    Thread.find().then((threads) => {
        res.status(200).json(threads);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id', (req, res, next) => {
    Promise.all([Thread.find({_id: req.params.id}), Comment.find({threadId: req.params.id}).populate({
        votesOfUsers: {
            upVotes: {
                path: 'upVotes',
                model: 'user'
            },
            downVotes: {
                path: 'downVotes',
                model: 'user'
            }
        }
    })]).then((result) => {
        res.status(200).json({
            thread: result[0],
            comments: result[1]
        });
    }).catch((error) => {
        next(error);
    });
});

router.put('/:id', (req, res, next) => {
    try {
        assert(req.params.id.length === 19, 'Invalid id');

        Thread.findByIdAndUpdate(req.params.id, {
            content: req.body.content
        }).then(() => {
            res.status(200).json('Thread is updated!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

router.delete('/:id', (req, res, next) => {
    try {
        assert(req.params.id.length === 19, 'Invalid id');


        Promise.all([Thread.findByIdAndRemove(req.params.id), Comment.deleteMany({threadId: req.params.id})]).then(() => {
            res.status(200).json('Thread has been deleted!');
        }).catch((error) => {
            next(error);
        });

    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
