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
    } catch(ex){
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
    Thread.find({_id: req.params.id}).then((thread) => {
        res.status(200).json(thread);
    }).catch((error) => {
        next(error);
    });
});

router.get('/:id/comments', (req, res, next) => {
    Comment.find({threadId: req.params.id}).then((comments) => {
        res.status(200).json(comments);
    }).catch((error) => {
        next(error);
    });
});

router.put('/:id', (req, res, next) => {
    try {
        assert(req.params.id.length === 19, 'Invalid id');

        Thread.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
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

        Thread.findByIdAndRemove(req.params.id).then(() => {
            res.status(200).json('Thread has been deleted!');
        }).catch((error) => {
            next(error);
        });
    } catch (ex) {
        next(ex);
    }
});

module.exports = router;
