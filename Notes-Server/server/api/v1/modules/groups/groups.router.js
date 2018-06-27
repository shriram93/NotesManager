const router = require('express').Router();
const groupsDAO = require('./groups.dao');
const auth = require('../auth');

//protect groups routes
router.use(auth.isAuthenticated);

//Add new group for a user
router.post('/create', (req, res) => {
  if (req.body.userid && req.body.title && req.body.description) {
    const groupObj = {
      title: req.body.title,
      description: req.body.description
    }
    groupsDAO.createGroup(req.body.userid, groupObj, (err, newGroup) => {
      if (err) {
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

//Add a specific note to the group
router.post('/addnote', (req, res) => {
  if (req.body.userid && req.body.groupid && req.body.noteid) {
    groupsDAO.addNoteToGroup(req.body.userid, req.body.groupid, req.body.noteid, (err, group) => {
      if (err && (err.message === 'Cannot find note' || err.message === 'Cannot find group')) {
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

//Remove a specific note to the group
router.post('/removenote', (req, res) => {
  if (req.body.userid && req.body.groupid && req.body.noteid) {
    groupsDAO.removeNoteFromGroup(req.body.userid, req.body.groupid, req.body.noteid, (err, group) => {
      if (err && (err.message === 'Cannot find note' || err.message === 'Cannot find group')) {
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

//Get all groups of a user
router.post('/', (req, res) => {
  if (req.body.userid) {
    groupsDAO.findGroups(req.body.userid, (err, groups) => {
      if (err && err.message === 'No groups found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(groups);
      }

    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Get group details of a user
router.post('/group', (req, res) => {
  if (req.body.userid && req.body.groupid) {
    groupsDAO.getGroup(req.body.userid, req.body.groupid, (err, group) => {
      if (err && err.message === 'No group found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(group);
      }

    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Delete a group for a user
router.post('/delete', (req, res) => {
  if (req.body.userid && req.body.groupid) {
    groupsDAO.deleteGroup(req.body.userid, req.body.groupid, (err) => {
      if (err && err.message === 'Cannot find group') {
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

module.exports = router;