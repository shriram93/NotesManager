const router = require('express').Router();
const remaindersDAO = require('./remainders.dao');
const auth = require('../auth');

//protect remainders routes
router.use(auth.isAuthenticated);

//Add new remainder for a user
router.post('/create', (req, res) => {
  if (req.body.userid && req.body.noteid && req.body.remaindertime) {
    const remainderObj = {
      noteId: req.body.noteid,
      remainderTime: req.body.remaindertime
    }
    remaindersDAO.createRemiander(req.body.userid, remainderObj, (err, newRemainder) => {
      if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(newRemainder);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Get details of a remainder
router.post('/detail', (req, res) => {
  if (req.body.userid && req.body.remainderid) {
    remaindersDAO.getRemainder(req.body.userid, req.body.remainderid, (err, remainder) => {
      if (err && err.message === 'Cannot find remainder') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(remainder);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Delete a remainder
router.post('/delete', (req, res) => {
  if (req.body.userid && req.body.noteid && req.body.remainderid) {
    remaindersDAO.deleteRemiander(req.body.userid, req.body.noteid, req.body.remainderid, (err, remainder) => {
      if (err && err.message === 'Cannot find note') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send({
          message: "success"
        });
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Dismiss a remainder
router.post('/dismiss', (req, res) => {
  if (req.body.userid && req.body.remainderid) {
    remaindersDAO.dismissRemiander(req.body.userid, req.body.remainderid, (err, remainder) => {
      if (err && err.message === 'Cannot find remainder') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send({
          message: "success"
        });
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Snooze a remainder for the given snoozetime
router.post('/snooze', (req, res) => {
  if (req.body.userid && req.body.remainderid && req.body.snoozetime) {
    remaindersDAO.snoozeRemiander(req.body.userid, req.body.remainderid, req.body.snoozetime, (err, remainder) => {
      if (err && err.message === 'Cannot find remainder') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send({
          message: "success"
        });
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Get all remainders of a user
router.post('/', (req, res) => {
  if (req.body.userid) {
    remaindersDAO.findRemainders(req.body.userid, (err, remainders) => {
      if (err && err.message === 'No remainders found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(remainders);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

module.exports = router;