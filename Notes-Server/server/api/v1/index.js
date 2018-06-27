const router = require('express').Router();

// router handler to call given route
router.use('/users',require('./modules/users'));
router.use('/notes', require('./modules/notes'));
router.use('/groups', require('./modules/groups'));
router.use('/remainders',require('./modules/remainders'));

// exporting router to handle request
module.exports =  router