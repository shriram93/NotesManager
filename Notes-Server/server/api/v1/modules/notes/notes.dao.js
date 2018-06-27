const noteModel = require('./notes.entity');
const groupModel = require('../groups/groups.entity');
const userModel = require('../users/users.entity');
const remainderModel = require('../remainders/remainders.entity');
const uuidv4 = require('uuid/v4');
const async = require("async");

//Add new note for given user id
const addNote = (userId, noteObj, done) => {
  const newNote = new noteModel({
    noteId: uuidv4(),
    userId: userId,
    title: noteObj.title,
    content: noteObj.content,
    groupId: '',
    permission: 'author'
  });
  newNote.save((err, savedNote) => {
    if (err) {
      //console.log("Error in created new note ", err);
      return done(err);
    } else {
      return done(null, savedNote);
    }
  });
};

//Delete a note for given user id
const deleteNote = (userId, noteId, done) => {
  noteModel.findOne({
      userId: userId,
      noteId: noteId
    },
    (err, note) => {
      if (err) {
        //console.log("Error in finding note ", err);
        return done(err);
      } else if (!note) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        async.waterfall([deleteFromGroup.bind(null, note), deleteParentNote, deleteSharedNote, deleteRemainder, deleteSingleNote], (err, res) => {
          if (err) {
            return done(err, null);
          } else {
            return done(null, res);
          }
        });
      }
    }
  );
};

//Delete note from a group
function deleteFromGroup(note, done) {
  if (note.groupId) {
    groupModel.findOneAndUpdate({
      groupId: note.groupId,
      userId: note.userId
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
        return done(err);
      } else if (!updatedGroup) {
        err = new Error("Cannot find group");
        return done(err, null);
      } else {
        return done(null, note);
      }
    });
  } else {
    return done(null, note);
  }
}

//Delete all shared notes of a parent note
function deleteParentNote(note, done) {
  if (note.sharedNotes && note.sharedNotes.length > 0) {
    note.sharedNotes.forEach(sharedNote => {
      deleteSingleNote(sharedNote, (err) => {
        if (err) {
          return done(err);
        }
      });
    });
    return done(null, note);
  } else {
    return done(null, note);
  }
}

//Delete shared note details from parent note
function deleteSharedNote(note, done) {
  if (note.parentNoteId) {
    noteModel.findOne({
        noteId: note.parentNoteId
      },
      (err, parentNote) => {
        if (err) {
          return done(err);
        } else if (parentNote) {
          noteModel.findOneAndUpdate({
            noteId: note.parentNoteId
          }, {
            $pull: {
              sharedNotes: {
                noteId: note.noteId
              }
            },
            $set: {
              modifiedOn: Date.now()
            }
          }, {
            new: true
          }, (err, updatedNote) => {
            if (err) {
              return done(err);
            } else {
              return done(null, note);
            }
          });
        }
      })
  } else {
    return done(null, note);
  }
}

//Delete remainders of a note
function deleteRemainder(note, done) {
  if (note.remainderId) {
    noteModel.findOneAndUpdate({
        userId: note.userId,
        noteId: note.noteId
      }, {
        $set: {
          remainderId: ""
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
          return done(err);
        } else {
          remainderModel.deleteOne({
            userId: note.userId,
            groupId: note.remainderId
          }, (err) => {
            if (err) {
              return done(err);
            } else {
              return done(null, note);
            }
          });
        }
      }
    );
  } else {
    return done(null, note);
  }
}

//Delete a single note from database
function deleteSingleNote(note, done) {
  noteModel.deleteOne({
    userId: note.userId,
    noteId: note.noteId
  }, (err, note) => {
    if (err) {
      return done(err);
    } else {
      return done(null, note);
    }
  });
}


//Update note details for a given user id
const updateNoteDetails = (userId, noteId, updateDetails, done) => {
  noteModel.findOneAndUpdate({
      userId: userId,
      noteId: noteId
    }, {
      $set: {
        title: updateDetails.title,
        content: updateDetails.content,
        modifiedOn: Date.now()
      }
    }, {
      new: true
    },
    (err, savedNote) => {
      if (err) {
        return done(err);
      } else if (!savedNote) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        async.waterfall([editParentNote.bind(null, savedNote), editSharedNote], (err, res) => {
          if (err) {
            return done(err, null);
          } else {
            return done(null, res);
          }
        });
      }
    }
  );
};


//Save parent note details to all shared notes
function editParentNote(parentNote, done) {
  if (parentNote.sharedNotes && parentNote.sharedNotes.length > 0) {
    parentNote.sharedNotes.forEach(sharedNote => {
      editSingleNote(sharedNote, parentNote, (err) => {
        if (err) {
          return done(err);
        }
      });
    });
    return done(null, parentNote);
  } else {
    return done(null, parentNote);
  }
}

//Edit a single note
function editSingleNote(note, updateDetails, done) {
  noteModel.findOneAndUpdate({
      userId: note.userId,
      noteId: note.noteId
    }, {
      $set: {
        title: updateDetails.title,
        content: updateDetails.content,
        modifiedOn: Date.now()
      }
    }, {
      new: true
    },
    (err, savedNote) => {
      if (err) {
        return done(err);
      } else if (!savedNote) {
        err = new Error("Cannot find note");
        return done(err);
      } else {
        return done(null, note);
      }
    }
  );
}

//Save shared note details in parent note
function editSharedNote(note, done) {
  if (note.parentNoteId) {
    noteModel.findOne({
        noteId: note.noteId,
        permission: "Read/Edit"
      },
      (err, sharedNote) => {
        if (err) {
          return done(err);
        } else if (sharedNote) {
          noteModel.findOne({
              noteId: note.parentNoteId
            },
            (err, parentNote) => {
              if (err) {
                return done(err);
              } else if (!parentNote) {
                err = new Error("Cannot find parent note");
                return done(err, null);
              } else {
                noteModel.findOneAndUpdate({
                  userId: parentNote.userId,
                  noteId: parentNote.noteId
                }, {
                  $set: {
                    title: note.title,
                    content: note.content,
                    modifiedOn: Date.now()
                  }
                }, {
                  new: true
                }, (err, note) => {
                  if (err) {
                    return done(err);
                  } else {
                    editParentNote(note, (err, note) => {
                      if (err) {
                        return done(err);
                      } else {
                        return done(null, note);
                      }
                    });

                  }
                });
              }
            })
        } else {
          return done(null, note);
        }
      });

  } else {
    return done(null, note);
  }
}


//Toggle favorite status for a note
const toggleNoteFavStatus = (userId, noteId, done) => {
  noteModel.findOne({
      userId: userId,
      noteId: noteId
    },
    (err, note) => {
      if (err) {
        //console.log("Error in finding note ", err);
        return done(err);
      } else if (!note) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        const favoriteStatus = note.favorite;
        noteModel.findOneAndUpdate({
          userId: userId,
          noteId: noteId
        }, {
          $set: {
            favorite: !favoriteStatus
          }
        }, {
          new: true
        }, (err, savedNote) => {
          if (err) {
            //console.log("Error in updating note ", err);
            return done(err);
          } else {
            return done(null, savedNote);
          }
        });
      }
    }
  );
};

//Find all notes of a userId for given one/more condition
const findNotes = (userId, {
  fav,
  title,
  groupId,
  limit,
  page,
  order
}, done) => {
  page = page || 1;
  limit = limit || 0;
  order = order || 1;
  let query = {}
  query.userId = userId;
  if (fav)
    query.favorite = fav;
  if (title)
    query.title = title;
  if (groupId)
    query.groupId = groupId;
  noteModel
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({
      modifiedOn: order
    })
    .exec((err, notes) => {
      if (err) {
        //console.log("Error in finding notes ", err);
        return done(err);
      } else if (!notes) {
        err = new Error("No notes found");
        return done(err, null);
      } else {
        return done(null, notes);
      }
    });
};

//Share note with other user
const shareNote = (userId, noteId, shareUserId, sharePermission, done) => {
  noteModel.findOne({
      userId: userId,
      noteId: noteId
    },
    (err, parentNote) => {
      if (err) {
        return done(err);
      } else if (!parentNote) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        userModel.findOne({
            userId: shareUserId
          },
          (err, shareUser) => {
            if (err) {
              return done(err);
            } else if (!shareUser) {
              err = new Error("Cannot find share user");
              return done(err, null);
            } else {
              noteModel.findOne({
                noteId: noteId,
                userId: userId,
                sharedNotes: {
                  $elemMatch: {
                    userId: shareUserId
                  }
                }
              }, (err, note) => {
                if (err) {
                  return done(err);
                } else if (note) {
                  err = new Error("Already shared with the same user");
                  return done(err, null);
                } else {
                  const newNote = new noteModel({
                    noteId: uuidv4(),
                    userId: shareUser.userId,
                    title: parentNote.title,
                    content: parentNote.content,
                    groupId: '',
                    permission: sharePermission,
                    parentNoteId: parentNote.noteId
                  });
                  newNote.save((err, savedNote) => {
                    if (err) {
                      return done(err);
                    } else {
                      const sharedNote = {
                        noteId: savedNote.noteId,
                        userId: savedNote.userId,
                        permission: savedNote.permission
                      }
                      noteModel.findOneAndUpdate({
                        userId: userId,
                        noteId: noteId
                      }, {
                        $addToSet: {
                          sharedNotes: sharedNote
                        },
                        $set: {
                          modifiedOn: Date.now()
                        }
                      }, {
                        new: true
                      }, (err, savedNote) => {
                        if (err) {
                          return done(err);
                        } else {
                          return done(null, savedNote);
                        }
                      });
                    }
                  });
                }
              });
            }
          });
      }
    }
  );
};

//Unshare note already shared
const unshareNote = (userId, noteId, shareUserId, done) => {
  noteModel.findOne({
      userId: userId,
      noteId: noteId,
      sharedNotes: {
        $elemMatch: {
          userId: shareUserId
        }
      }
    }, 'sharedNotes',
    (err, res) => {
      if (err) {
        return done(err);
      } else if (!res) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        const sharedNote = res.sharedNotes.filter(sharedNote => {
          if (sharedNote.userId === shareUserId)
            return true;
        })
        noteModel.deleteOne({
          noteId: sharedNote[0].noteId
        }, (err, note) => {
          if (err) {
            return done(err);
          } else {
            noteModel.findOneAndUpdate({
              userId: userId,
              noteId: noteId
            }, {
              $pull: {
                sharedNotes: {
                  userId: shareUserId
                }
              },
              $set: {
                modifiedOn: Date.now()
              }
            }, {
              new: true
            }, (err, note) => {
              if (err) {
                return done(err);
              } else {
                return done(null, note);
              }
            });
          }
        });

      }
    });

};

//Get details of a particular noteId
const getNote = (noteId, done) => {
  noteModel.findOne({
      noteId: noteId
    },
    (err, note) => {
      if (err) {
        return done(err);
      } else if (!note) {
        err = new Error("Cannot find note");
        return done(err, null);
      } else {
        return done(null, note);
      }
    });
}

module.exports = {
  addNote,
  deleteNote,
  updateNoteDetails,
  toggleNoteFavStatus,
  getNote,
  findNotes,
  shareNote,
  unshareNote,
  getNote
};