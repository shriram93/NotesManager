const remainderModel = require('./remainders.entity');
const noteModel = require('../notes/notes.entity');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

//Creating a new remainder
const createRemiander = (userId, remainderObj, done) => {
  const remainderTime = moment(remainderObj.remainderTime, 'DD/MM/YYYY hh:mm A').toDate();
  const newRemainder = new remainderModel({
    remainderId: uuidv4(),
    userId: userId,
    noteId: remainderObj.noteId,
    remainderTime: remainderTime
  });
  newRemainder.save((err, newRemainder) => {
    if (err) {
      //console.log("Error in created new remiander ", err);
      return done(err);
    } else {
      noteModel.findOneAndUpdate({
        noteId: remainderObj.noteId
      }, {
        $set: {
          remainderId: newRemainder.remainderId
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
          return done(null, newRemainder);
        }
      });
    }
  });
};

//Get the remainder details
const getRemainder = (userId, remainderId, done) => {
  remainderModel.findOne({
    remainderId: remainderId,
    userId: userId
  }, (err, remainder) => {
    if (err) {
      //console.log("Error in finding remainder ", err);
      return done(err);
    } else if (!remainder) {
      err = new Error("Cannot find remainder");
      return done(err, null);
    } else {
      return done(null, remainder);
    }
  });
};

//Remove remainder from a note
const deleteRemiander = (userId, noteId, remainderId, done) => {
  noteModel.findOneAndUpdate({
      userId: userId,
      noteId: noteId
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
        return done(err, null);
      } else {
        remainderModel.deleteOne({
          userId: userId,
          remainderId: remainderId
        }, (err) => {
          if (err) {
            return done(err);
          } else {
            return done(null);
          }
        });
      }
    }
  );
};

//Dismiss remainder for a note
const dismissRemiander = (userId, remainderId, done) => {
  remainderModel.findOneAndUpdate({
    userId: userId,
    remainderId: remainderId
  }, {
    $set: {
      isDismissed: true
    }
  }, {
    new: true
  }, (err, remainder) => {
    if (err) {
      //console.log("Error in updating remainder ", err);
      return done(err);
    } else if (!remainder) {
      err = new Error("Cannot find remainder");
      return done(err, null);
    } else {
      return done(null, remainder);
    }
  });
};

//Snooze remainder for a note
const snoozeRemiander = (userId, remainderId, snoozeTimeInMins, done) => {
  remainderModel.findOne({
      userId: userId,
      remainderId: remainderId
    },
    (err, remainder) => {
      if (err) {
        //console.log("Error in finding remainder ", err);
        return done(err);
      } else if (!remainder) {
        err = new Error("Cannot find remainder");
        return done(err, null);
      } else {
        const newRemainderTime = moment(remainder.remainderTime).add(snoozeTimeInMins, 'minutes').toDate();
        remainderModel.findOneAndUpdate({
          userId: userId,
          remainderId: remainderId
        }, {
          $set: {
            remainderTime: newRemainderTime
          }
        }, {
          new: true
        }, (err, savedRemainder) => {
          if (err) {
            //console.log("Error in updating remainder ", err);
            return done(err);
          } else {
            return done(null, savedRemainder);
          }
        });
      }
    }
  );
};

//Find all remainders of a userId for given one/more condition
const findRemainders = (userId, done) => {
  remainderModel.find({
    userId: userId
  }, (err, remainders) => {
    if (err) {
      return done(err);
    } else if (!remainders) {
      err = new Error("No remainders found");
      return done(err, null);
    } else {
      return done(null, remainders);
    }
  });
};


module.exports = {
  createRemiander,
  getRemainder,
  deleteRemiander,
  dismissRemiander,
  snoozeRemiander,
  findRemainders
};