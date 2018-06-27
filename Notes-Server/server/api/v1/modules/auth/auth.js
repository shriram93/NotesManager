const jwt = require('jsonwebtoken');
const appConfig = require('../../../../config');
const jwtSecretKey = require('../../../../config').jwtToken.secret;

// To generate a JWT token with given payload
const signToken = (payload, secret, expireIn, done) => {
  jwt.sign(payload, secret, {
    expiresIn: expireIn
  }, (err, token) => {
    if (err)
      return done(err.message);
    else
      return done(null, token);
  });
};

// Check if the token passed is valid
const verifyToken = (token, secret, done) => {
  jwt.verify(token, secret, (err, decoded) => {
    if (err)
      return done(err.message);
    else
      return done(null, decoded);
  });
};

//Verify token and protect notes routes
const isAuthenticated = (req, res, next) => {

  let token;
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    // Handle token presented as a Bearer token in the Authorization header
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    // Check if the token is valid
    verifyToken(token, jwtSecretKey, (err, decoded) => {
      // Send forbidden error message if token is invalid
      if (err) {
        res.status(403).send(err);
      } else {
        next();
      }
    });
  } else {
    // Send forbidden error message if there is no token
    return res.status(403).send('Not authenticated');
  }
};

module.exports = {
  signToken,
  verifyToken,
  isAuthenticated
};