const express = require('express');
const router = express.Router();

const commentRoute = require('./apiv1/commentroute');
const userRoute = require('./apiv1/userroute');
const threadRoute = require('./apiv1/threadroute');

router.use('/threads', threadRoute);
router.use('/users', userRoute);
router.use('/comments', commentRoute);

module.exports = router;
