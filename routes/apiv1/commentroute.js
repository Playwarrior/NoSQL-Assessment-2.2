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

module.exports = router;
