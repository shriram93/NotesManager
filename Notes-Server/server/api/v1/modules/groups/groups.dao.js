const groupModel = require('./groups.entity');
const noteModel = require('../notes/notes.entity');
const uuidv4 = require('uuid/v4');

//Creating a new group
const createGroup = (userId, groupObj, done) => {
  const newGroup = new groupModel({
    groupId: uuidv4(),
    userId: userId,
    title: groupObj.title,
    description: groupObj.description
  });
  newGroup.save((err, newGroup) => {
    if (err) {
      //console.log("Error in created new group ", err);
      return done(err);
    } else {
      return done(null, newGroup);
    }
  });
};

//Add a specific note to the group
const addNoteToGroup = (userId, groupId, noteId, done) => {
  noteModel.findOneAndUpdate({
    userId: userId,
    noteId: noteId
  }, {
    $set: {
      groupId: groupId
    }
  }, {
    new: true
  }, (err, updatedNote) => {
    if (err) {
      //console.log("Error in updating note ", err );
      return done(err);
    } else if (!updatedNote) {
      err = new Error("Cannot find note");
      return done(err, null);
    } else {
      groupModel.findOneAndUpdate({
        groupId: groupId,
        userId: userId
      }, {
        $addToSet: {
          notes: updatedNote
        },
        $set: {
          modifiedOn: Date.now()
        }
      }, {
        new: true
      }, (err, updatedGroup) => {
        if (err) {
          //console.log("Error in updating group ", err);
          return done(err);
        } else if (!updatedGroup) {
          err = new Error("Cannot find group");
          return done(err, null);
        } else {
          return done(null, updatedGroup);
        }
      });
    }
  });
};

//Remove the note from the group
const removeNoteFromGroup = (userId, groupId, noteId, done) => {
  noteModel.findOneAndUpdate({
      userId: userId,
      noteId: noteId
    }, {
      $set: {
        groupId: ""
      }
    }, {
      new: true
    },
    (err, note) => {
      if (err) {
        //console.log("Error in finding note ", err);
        return done(err);
      } else if (!note) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        groupModel.findOneAndUpdate({
          groupId: groupId,
          userId: userId
        }, {
          $pull: {
            notes: note
          },
          $set: {
            modifiedOn: Date.now()
          }
        }, {
          new: true
        }, (err, updatedGroup) => {
          if (err) {
            //console.log("Error in updating group ", err);
            return done(err);
          } else if (!updatedGroup) {
            err = new Error("Cannot find group");
            return done(err, null);
          } else {
            return done(null, updatedGroup);
          }
        });
      }
    }
  );
};

//Get the group details
const getGroup = (userId, groupId, done) => {
  groupModel.findOne({
    groupId: groupId,
    userId: userId
  }, (err, group) => {
    if (err) {
      //console.log("Error in finding group ", err);
      return done(err);
    } else if (!group) {
      err = new Error("Cannot find group");
      return done(err, null);
    } else {
      return done(null, group);
    }
  });
};

//Find all groups of a userId
const findGroups = (userId, done) => {
  groupModel.find({
    userId: userId
  }, (err, groups) => {
    if (err) {
      return done(err);
    } else if (!groups) {
      err = new Error("No groups found");
      return done(err, null);
    } else {
      return done(null, groups);
    }
  });
};

//Delete a group for a user
const deleteGroup = (userId, groupId, done) => {
  groupModel.findOne({
    groupId: groupId,
    userId: userId
  }, (err, group) => {
    if (err) {
      return done(err);
    } else if (!group) {
      err = new Error("Cannot find group");
      return done(err, null);
    } else {
      noteModel.updateMany({
        userId: userId,
        groupId: groupId
      }, {
        $set: {
          modifiedOn: Date.now()
        },
        $set: {
          groupId: ""
        }
      }, (err) => {
        if (err) {
          return done(err);
        } else {
          groupModel.deleteOne({
            userId: userId,
            groupId: groupId
          }, (err) => {
            if (err) {
              return done(err);
            } else {
              return done(null);
            }
          });
        }
      });
    }
  });
};

module.exports = {
  createGroup,
  deleteGroup,
  addNoteToGroup,
  removeNoteFromGroup,
  getGroup,
  findGroups
};