const router = require('express').Router();

// router handler to call given route
router.use('/v1', require('./v1'));

// exporting router to handle request
module.exports = router;