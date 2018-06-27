const router = require('express').Router();
const jwtSecretKey = require('../../../../config').jwtToken.secret;
const auth = require('../auth');
const usersDAO = require('./users.dao');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

//Api for new user to regitser
router.post('/register', (req, res) => {
  if (req.body.name && req.body.email && req.body.password) {
    const userData = {
      userId: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    }
    //Insert data into the db
    usersDAO.createUser(userData, (err, createdUser) => {
      if (err) {
        //Duplicate entry, user already registered
        if (err.code == "11000") {
          return res.status(400).send({
            message: "email already exist"
          });
        } else {
          return res.status(500).send({
            message: err.message
          });
        }
      } else {
        //User account created succeesfully
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

// Api for users to login and get JWT token
router.post('/login', (req, res) => {
  // Checking if all the required fields are passed
  if (req.body.email &&
    req.body.password) {
    usersDAO.loginUser(req.body.email, (err, user) => {
      if (err)
        return res.status(500).send({
          message: err.message
        });
      //Invalid user
      if (!user)
        return res.status(401).send({
          message: 'User not found'
        });
      bcrypt.compare(req.body.password, user.password, function (err, result) {
        //Invalid password
        if (err)
          return res.status(500).send({
            message: err.message
          });
        if (result === true) {
          // Generate JWT token with given payloa data which expires in 10 hours
          auth.signToken(req.body, jwtSecretKey, '10h', (err, token) => {
            // If any error, send user error message to user
            if (err) {
              return res.status(500).send({
                message: err.message
              });
            }
            // If no error, send the JWT generated
            else {
              return res.status(200).send({
                token: token,
                userId: user.userId
              });
            }
          });
        } else {
          return res.status(403).send({
            message: 'Wrong password'
          });
        }
      })
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

//protect user routes
router.use(auth.isAuthenticated);

// Api to get a user deatil
router.post('/detail', (req, res) => {
  if (req.body.userid) {
    usersDAO.userDetails(req.body.userid, (err, user) => {
      if (err && err.message === 'Cannot find user') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send({
          userId: user.userId,
          name: user.name,
          email: user.email
        });
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});

// Api to get a other user details
router.post('/otherusers', (req, res) => {
  if (req.body.userid) {
    usersDAO.getOtherUsers(req.body.userid, (err, otherUsers) => {
      if (err && err.message === 'Cannot find user') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err && err.message === 'No other users found') {
        return res.status(404).send({
          message: err.message
        });
      } else if (err) {
        return res.status(500).send({
          message: err.message
        });
      } else {
        return res.status(200).send(otherUsers);
      }
    });
  } else {
    return res.status(400).send({
      message: "Invalid request"
    });
  }
});


module.exports = router;