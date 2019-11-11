const express = require('express');
const router = express.Router();

const Thread = require('../../models/thread');

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



module.exports = router;
