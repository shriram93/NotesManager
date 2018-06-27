const User = require('./users.entity');

//Creating user in database
const createUser = (userData, done) => {
  User.create(userData, (err, createdUser) => {
    if (err) {
      return done(err);
    } else {
      return done(null, createdUser);
    }
  });
};

//Querying database for the user email address
const loginUser = (userEmail, done) => {
  User.findOne({
    email: userEmail
  }, (err, userDetails) => {
    if (err) {
      return done(err);
    } else {
      return done(null, userDetails);
    }
  });
};

//Querying database for the given userId
const userDetails = (userid, done) => {
  User.findOne({
    userId: userid
  }, (err, userDetails) => {
    if (err) {
      return done(err);
    } else if (!userDetails) {
      err = new Error("Cannot find user");
      return done(err, null);
    } else {
      return done(null, userDetails);
    }
  });
}

//Querying database to get other user details
const getOtherUsers = (userid, done) => {
  User.findOne({
    userId: userid
  }, (err, userDetails) => {
    if (err) {
      return done(err);
    } else if (!userDetails) {
      err = new Error("Cannot find user");
      return done(err, null);
    } else {
      User.find({
        userId: {
          $ne: userid
        }
      }, 'userId name email', (err, otherUsers) => {
        if (err) {
          return done(err);
        } else if (!otherUsers) {
          err = new Error("No other users found");
          return done(err, null);
        } else {
          return done(null, otherUsers);
        }
      });
    }
  });
};


module.exports = {
  createUser,
  loginUser,
  userDetails,
  getOtherUsers
};