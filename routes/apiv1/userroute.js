const express = require('express');
const router = express.Router();

const User = require('../../models/user');

router.get('', (req, res, next) => {
    User.find().then((users) => {
        res.status(200).json(users);
    }).catch((error) => {
       next(error);
    });
});

module.exports = router;
