const express = require('express');
const router = express.Router();

const commentRoute = require('./apiv1/commentroute');
const userRoute = require('./apiv1/userroute');
const threadRoute = require('./apiv1/threadroute');
const friendshipRoute = require('./apiv1/friendshipRoute');

router.use('/threads', threadRoute);
router.use('/users', userRoute);
router.use('/comments', commentRoute);
router.use('/friendships', friendshipRoute);

module.exports = router;
