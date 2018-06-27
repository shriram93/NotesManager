const app = require('../../index');
const httpws = require('http').Server(app);
const io = require('socket.io')(httpws);
const moment = require('moment');
const uuidv4 = require('uuid/v4');

//Remainder constructor function
function Remainder(remainderId) {
  this.remainderId = remainderId;
  this.events = [];
}

//Search for a remainder object using remainderId in remainders object array
const getRemainderIndex = (remainderId, remainders) => {
  let index = -1;
  remainders.some(function (entry, i) {
    if (entry.remainderId == remainderId) {
      index = i;
      return true;
    }
  });
  return index;
}

//When a client connects to the socket
io.sockets.on('connection', function (socket) {
  console.log('Socket connected');
  const remainders = [];

  //When a user login the application, add the userId to the room
  socket.on('login', function (userId) {
    socket.join(userId);
  });

  //When a user logsout the application, remove the userId from the room
  socket.on('logout', function (userId) {
    socket.leave(userId);
  });

  // Socket event for note shared
  socket.on('noteShared', function (data) {
    console.log('emitted note shared to the specific user : ', data.shareUserId);
    //Frame response
    const response = {
      resposneId: uuidv4(),
      parentUserId: data.parentUserId,
      shareUserId: data.shareUserId
    }
    //Emit the response to the other user
    io.sockets.in(data.shareUserId).emit('noteShared', response);

  });

  // Socket event for edit in shared note
  socket.on('sharedNoteEdited', function (userId) {
    console.log('emitted shared note edited by the user : ', userId);
    //Frame response
    const response = {
      resposneId: uuidv4(),
      userId: userId
    }
    //Emit the response to the parent or shared user
    io.sockets.in(userId).emit('sharedNoteEdited', response);
  });

  // Socket event for registering remainder
  socket.on('registerRemainder', function (remainder) {
    //Check if a remainder already created for the same remainderId
    const index = getRemainderIndex(remainder.remainderId, remainders);
    if (index == -1) {
      console.log(remainder);

      //Calculate the number of seconds remaining for the remainder to go live
      const currentDateTime = moment(new Date());
      const remainderDateTime = moment(remainder.remainderTime);
      const intervalSeconds = remainderDateTime.diff(currentDateTime, 'seconds');
      console.log(intervalSeconds);

      if (intervalSeconds > 0) {

        //If the interval is greater than zero, then create a setTimeout function using the interval seconds calculated
        const myEvent1 = setTimeout(() => {
          console.log('emitting remainder event to user: ', remainder.userId)
          const response = {
            resposneId: uuidv4(),
            remainder: remainder
          }
          io.sockets.in(remainder.userId).emit('notifyRemainder', response);
          const index = getRemainderIndex(remainder.remainderId, remainders);
          if (index != -1) {
            remainders.splice(index, 1);
          }
        }, intervalSeconds * 1000)

        //Store the remiander event created and remainderId in a list, this is 
        //  used to avoid duplicates and also deregister the event if the user cancels in future
        const remainderObj = new Remainder(remainder.remainderId);
        remainderObj.events.push(myEvent1);

        if (intervalSeconds > 15 * 60) {
          //If the interval seconds is greater than 15 minutes, then also create a event on
          // 15 minutes before actual remiander time 
          const myEvent2 = setTimeout(() => {
            console.log('emitting remainder event 15 mins before to user: ', remainder.userId)
            const response = {
              resposneId: uuidv4(),
              remainder: remainder
            }
            io.sockets.in(remainder.userId).emit('preNotifyRemainder', response);
            const index = getRemainderIndex(remainder.remainderId, remainders);
            if (index != -1) {
              remainders.splice(index, 1);
            }
          }, ((intervalSeconds - (15 * 60))) * 1000);

          remainderObj.events.push(myEvent2);
        }

        remainders.push(remainderObj);
      }
      //If the interval seconds is less than zero, then this means the remiander time 
      // already elapsed and the user was not online at that time, so show the remainder now itsef
      else {
        const response = {
          resposneId: uuidv4(),
          remainder: remainder
        }
        io.sockets.in(remainder.userId).emit('notifyRemainder', response);
      }
    }
  });


  //Socket event on deregistering remainder
  socket.on('unregisterRemainder', function (remainderId) {
    //Check if a remainder event exist for that remainderId
    const index = getRemainderIndex(remainderId, remainders);
    if (index != -1) {
      remainders[index].events.forEach(
        event => {
          clearTimeout(event);
        }
      );
      //Delete that remainder and all its events
      remainders.splice(index, 1);
    }
  });
});

module.exports = httpws;