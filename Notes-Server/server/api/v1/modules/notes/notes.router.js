const router = require('express').Router();
const notesDAO = require('./notes.dao');
const groupDAO = require('../groups/groups.dao');
const auth = require('../auth');

//protect notes routes
router.use(auth.isAuthenticated);

//Add new note for a user
router.post('/create', (req, res) => {
  if (req.body.userid && req.body.title && req.body.content) {
    const noteObj = {
      title: req.body.title,
      content: req.body.content
    }
    notesDAO.addNote(req.body.userid, noteObj, (err, savedNote) => {
      if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        if (req.body.groupid) {
          groupDAO.addNoteToGroup(req.body.userid, req.body.groupid, savedNote.noteId, (err, group) => {
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
          return res.status(200).send({
            message: "success"
          });
        }
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Delete a note for a user
router.post('/delete', (req, res) => {
  if (req.body.userid && req.body.noteid) {
    notesDAO.deleteNote(req.body.userid, req.body.noteid, (err, note) => {
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

//Update note for a user
router.put('/update', (req, res) => {
  if (req.body.userid && req.body.noteid && req.body.title && req.body.content) {
    const noteObj = {
      title: req.body.title,
      content: req.body.content
    }
    notesDAO.updateNoteDetails(req.body.userid, req.body.noteid, noteObj, (err, savedNote) => {
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

//Toggle note favorite status
router.put('/fav', (req, res) => {
  if (req.body.userid && req.body.noteid) {
    notesDAO.toggleNoteFavStatus(req.body.userid, req.body.noteid, (err, savedNote) => {
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

//Get all notes of a user
router.post('/', (req, res) => {
  if (req.body.userid) {
    notesDAO.findNotes(req.body.userid, {}, (err, notes) => {
      if (err && err.message === 'No notes found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(notes);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Get particular note details
router.post('/note', (req, res) => {
  if (req.body.noteid) {
    notesDAO.getNote(req.body.noteid, (err, note) => {
      if (err && err.message === 'No notes found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(note);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//Share a note with other user
router.post('/share', (req, res) => {
  if (req.body.userid && req.body.noteid && req.body.shareuserid && req.body.sharepermission) {
    notesDAO.shareNote(req.body.userid, req.body.noteid, req.body.shareuserid, req.body.sharepermission, (err, note) => {
      if (err && err.message === 'Cannot find note') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err && err.message === 'Cannot find share user') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err && err.message === 'Already shared with the same user') {
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

//unshare note already shared
router.post('/unshare', (req, res) => {
  if (req.body.userid && req.body.noteid && req.body.shareuserid) {
    notesDAO.unshareNote(req.body.userid, req.body.noteid, req.body.shareuserid, (err, note) => {
      if (err && err.message === 'Cannot find note') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err && err.message === 'Cannot find share user') {
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