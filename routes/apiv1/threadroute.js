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

module.exports = router;
