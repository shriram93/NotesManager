const expect = require('chai').expect;
const request = require('supertest');
const app = require('../index');
// testsuit starts from here
describe('Notes application testing', function () {
  let bearerToken, userId, userId2;

  let tempNote1, tempNote2;
  let tempGroup;
  let tempRemainder;

  //testsuit for user API
  describe('User API testing', function () {

    const firstUser = {
      "name": "test",
      "password": "1234",
      "email": "test@gmail.com"
    }
    const secondUser = {
      "name": "test1",
      "password": "1234",
      "email": "test1@gmail.com"
    }
    //Register new user
    it('Should create new user, returning success message', function (done) {
      request(app)
        .post('/api/v1/users/register')
        .send(firstUser)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Register another user
    it('Should create another new user, returning success message', function (done) {
      request(app)
        .post('/api/v1/users/register')
        .send(secondUser)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Register again with the same user details
    it('Should not create new user, if user is already present, returning error message', function (done) {
      request(app)
        .post('/api/v1/users/register')
        .send(firstUser)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(400);
          expect(res.text).to.equal('{"message":"email already exist"}');
          done();
        })
    });

    //Register with incomplete user details
    it('Should not create new user, if user the user details passed is invalid, returning error message', function (done) {
      const userDetails = {
        "email": "user@gmail.com",
        "name": "test"
      }
      request(app)
        .post('/api/v1/users/register')
        .send(userDetails)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(400);
          expect(res.text).to.equal('{"message":"Invalid request"}');
          done();
        })
    });

    //Login with first user details and get JWT token
    it('Should login into the system for first user, returning success message', function (done) {
      request(app)
        .post('/api/v1/users/login')
        .send(firstUser)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          const response = JSON.parse(res.text);
          bearerToken = response.token;
          userId = response.userId;
          expect(bearerToken).not.to.equal(undefined);
          expect(bearerToken.length).to.greaterThan(0);
          done();
        })
    });

    //Login with second user details and get JWT token
    it('Should login into the system for second user, returning success message', function (done) {
      request(app)
        .post('/api/v1/users/login')
        .send(secondUser)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          const response = JSON.parse(res.text);
          bearerToken = response.token;
          userId2 = response.userId;
          expect(bearerToken).not.to.equal(undefined);
          expect(bearerToken.length).to.greaterThan(0);
          done();
        })
    });

    //Login with user details not already registered
    it('Should not login into the system,if user is not already registered, returning error message', function (done) {
      const user = {
        "email": "temp",
        "password": "123"
      }
      request(app)
        .post('/api/v1/users/login')
        .send(user)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(401);
          expect(res.text).to.equal('{"message":"User not found"}');
          done();
        })
    });

    //Login with wrong password
    it('Should not login into the system,if user password is wrong, returning error message', function (done) {
      const user = {
        "email": firstUser.email,
        "password": "123"
      }
      request(app)
        .post('/api/v1/users/login')
        .send(user)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(403);
          expect(res.text).to.equal('{"message":"Wrong password"}');
          done();
        })
    });

    //Get a particular user detail
    it('Should return the user details for a given user id,returning success message', function (done) {
      const req = {
        userid: userId
      }
      request(app)
        .post('/api/v1/users/detail')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Get a other user details
    it('Should return other user details for a given user id,returning success message', function (done) {
      const req = {
        userid: userId
      }
      request(app)
        .post('/api/v1/users/otherusers')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });
  });

  //testsuit for notes API
  describe('Notes API testing', function () {

    //Add a new note for a user
    it('Should add a new note for a given user id,returning success message', function (done) {
      const newNote = {
        userid: userId,
        title: "test1",
        content: "test1"
      }
      request(app)
        .post('/api/v1/notes/create')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(newNote)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Add another note for same user
    it('Should add another note for the same user id,returning success message', function (done) {
      const newNote = {
        userid: userId,
        title: "test2",
        content: "test2"
      }
      request(app)
        .post('/api/v1/notes/create')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(newNote)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });


    //Get all notes of a user
    it('Should return all the notes for a given user id', function (done) {
      const req = {
        userid: userId
      }
      request(app)
        .post('/api/v1/notes/')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          const notes = JSON.parse(res.text);
          tempNote1 = notes[0];
          tempNote2 = notes[1];
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Get the detail of a particular note
    it('Should return the note details for a given note id', function (done) {
      const req = {
        noteid: tempNote1.noteId
      }
      request(app)
        .post('/api/v1/notes/note')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Toggle favorite status of note
    it('Should toggle the note favorite status,returning success message', function (done) {
      const req = {
        userid: userId,
        noteid: tempNote1.noteId
      }
      request(app)
        .put('/api/v1/notes/fav')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //update title/content of note
    it('Should update title/content of a note,returning success message', function (done) {
      const req = {
        userid: userId,
        noteid: tempNote1.noteId,
        title: "updatedTitle",
        content: "updatedContent"
      }
      request(app)
        .put('/api/v1/notes/update')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Share note with another user
    it('Should share the note with other user,returning success message', function (done) {
      const req = {
        userid: userId,
        noteid: tempNote1.noteId,
        shareuserid: userId2,
        sharepermission: "Read"
      }
      request(app)
        .post('/api/v1/notes/share')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Unshare note with another user
    it('Should unshare the note which was already shared,returning success message', function (done) {
      const req = {
        userid: userId,
        noteid: tempNote1.noteId,
        shareuserid: userId2
      }
      request(app)
        .post('/api/v1/notes/unshare')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Delete a note for a given note id
    it('Should delete a note which was already created,returning success message', function (done) {
      const req = {
        userid: userId,
        noteid: tempNote2.noteId,
      }
      request(app)
        .post('/api/v1/notes/delete')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });
  });


  //testsuit for groups API
  describe('Groups API testing', function () {
    //Create a new group for a user
    it('Should create a new group for a given user id,returning success message', function (done) {
      const newGroup = {
        userid: userId,
        title: "test",
        description: "test"
      }
      request(app)
        .post('/api/v1/groups/create')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(newGroup)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Get all groups of a user
    it('Should return all the groups for a given user id', function (done) {
      const req = {
        userid: userId
      }
      request(app)
        .post('/api/v1/groups/')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          const groups = JSON.parse(res.text);
          tempGroup = groups[0];
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Get the detail of a particular group
    it('Should return the group details for a given group id', function (done) {
      const req = {
        userid: userId,
        groupid: tempGroup.groupId
      }
      request(app)
        .post('/api/v1/groups/group')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Add note to a particular group
    it('Should add the note to a particular group,returning success message', function (done) {
      const req = {
        userid: userId,
        groupid: tempGroup.groupId,
        noteid: tempNote1.noteId
      }
      request(app)
        .post('/api/v1/groups/addnote')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Remove note from a particular group
    it('Should remove the note from a particular group,returning success message', function (done) {
      const req = {
        userid: userId,
        groupid: tempGroup.groupId,
        noteid: tempNote1.noteId
      }
      request(app)
        .post('/api/v1/groups/removenote')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Remove a group created by a user
    it('Should remove a group which was already created,returning success message', function (done) {
      const req = {
        userid: userId,
        groupid: tempGroup.groupId
      }
      request(app)
        .post('/api/v1/groups/delete')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

  });

  //testsuit for remainders API
  describe('Remainders API testing', function () {
    //Create a new remainder for a user
    it('Should create a new remainder for a given user id,returning success message', function (done) {
      const newRemainder = {
        userid: userId,
        noteid: tempNote1.noteId,
        remaindertime: '22/06/2018 8:25 AM'
      }
      request(app)
        .post('/api/v1/remainders/create')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(newRemainder)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Get all remainders of a user
    it('Should return all the remainders for a given user id', function (done) {
      const req = {
        userid: userId
      }
      request(app)
        .post('/api/v1/remainders/')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          const remainders = JSON.parse(res.text);
          tempRemainder = remainders[0];
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Get the detail of a particular remainder
    it('Should return the remainder details for a given remainder id', function (done) {
      const req = {
        userid: userId,
        remainderid: tempRemainder.remainderId
      }
      request(app)
        .post('/api/v1/remainders/detail')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text.length).to.greaterThan(0);
          done();
        })
    });

    //Snooze a remainder
    it('Should snooze the remainder for the given snooze time,returning success message', function (done) {
      const req = {
        userid: userId,
        remainderid: tempRemainder.remainderId,
        snoozetime: 5
      }
      request(app)
        .post('/api/v1/remainders/snooze')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Dismiss a remainder
    it('Should dimiss the remainder for a given remainder id,returning success message', function (done) {
      const req = {
        userid: userId,
        remainderid: tempRemainder.remainderId
      }
      request(app)
        .post('/api/v1/remainders/dismiss')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

    //Delete a remainder
    it('Should delete a remainder which was already created,returning success message', function (done) {
      const req = {
        userid: userId,
        remainderid: tempRemainder.remainderId,
        noteid: tempNote1.noteId
      }
      request(app)
        .post('/api/v1/remainders/delete')
        .set('Authorization', 'Bearer ' + bearerToken)
        .send(req)
        .end(function (err, res) {
          if (err)
            return done(err)
          expect(res.statusCode).to.equal(200);
          expect(res.text).to.equal('{"message":"success"}');
          done();
        })
    });

  });

});