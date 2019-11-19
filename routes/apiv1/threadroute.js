const express = require('express');
const router = express.Router();

const NullSector = require('../../util/nullsector');

const Thread = require('../../models/thread');
const Comment = require('../../models/comment');

function getSortCriteria(query) {
    const sort = {};

    if (query.upvotes) {
        sort.upVotesCount = 1;
    }

    if (query.downvotes) {
        sort.downVotesCount = 1;
    }

    if (query.comments) {
        sort.commentCount = 1;
    }

    return sort;
}

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
    NullSector.hasThread({_id: req.params.id}, (error, bool, thread) => {
        if (error)
            next(error);

        else if (!bool)
            next(new Error('No thread with the Id: ' + req.params.id));

        else {
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
        }
    });
});

router.put('/:id/upvote', (req, res, next) => {
    NullSector.hasThread({_id: req.params.id}, (error, bool, thread) => {
        if (error)
            next(error);

        else if (!bool)
            next(new Error('No thread with Id: ' + req.params.id));

        else {
            let upVotes = thread.votesOfUsers.upVotes;
            let downVotes = thread.votesOfUsers.downVotes;

            if (!upVotes.includes(res.get('id'))) {
                upVotes.push(res.get('id'));
                downVotes.remove(res.get('id'));
            }

            thread.update({
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Upvoted thread!');
            }).catch((error) => {
                next(error)
            });
        }
    });
});

router.put('/:id/downvote', (req, res, next) => {
    NullSector.hasThread({_id: req.params.id}, (error, bool, thread) => {
        if (error)
            next(error);

        else if (!bool)
            next(new Error('No thread with Id: ' + req.params.id));

        else {
            let upVotes = thread.votesOfUsers.upVotes;
            let downVotes = thread.votesOfUsers.downVotes;

            if (!upVotes.includes(res.get('id'))) {
                upVotes.remove(res.get('id'));
                downVotes.push(res.get('id'));
            }

            thread.update({
                votesOfUsers: {
                    upVotes: upVotes,
                    downVotes: downVotes
                }
            }).then(() => {
                res.status(200).json('Downvoted thread!');
            }).catch((error) => {
                next(error)
            });
        }
    });
});

router.get('', (req, res, next) => {
    Thread.find().sort(getSortCriteria(req.query)).then((threads) => {
        res.status(200).json(threads);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id', (req, res, next) => {
    Promise.all([Thread.findOne({_id: req.params.id}), Comment.find({threadId: req.params.id}).populate({
        path: 'user'
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
    NullSector.hasThread({_id: req.params.id}, (error, bool, thread) => {
        if (error)
            next(error);

        else if (!bool)
            next(new Error('No thread with Id: ' + req.params.id));

        else {
            thread.update({
                content: req.body.content
            }).then(() => {
                res.status(200).json('Thread is updated!');
            }).catch((error) => {
                next(error);
            });
        }
    });
});

router.delete('/:id', (req, res, next) => {
    NullSector.hasThread({_id: req.params.id, userId: res.get('id')}, (error, bool, thread) => {
        if (error)
            next(error);

        else if (!bool)
            next(new Error('No thread found with Id: ' + req.params.id));

        else {
            Promise.all([thread.remove(), Comment.deleteMany({threadId: req.params.id})])
                .then(() => {
                    res.status(200).json('Thread has been deleted!');
                }).catch((error) => {
                next(error);
            })
        }
    });
});

module.exports = router;
