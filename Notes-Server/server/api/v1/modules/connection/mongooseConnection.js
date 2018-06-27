const mongoose = require('mongoose');
const url = require('../../../../config').moongoseDB.url;

// Create a connection to the mongo database
mongoose.connect(url, function (err) {
  if (err) {
    console.log('Error connecting to mongo database');
    return;
  }
  console.log('Connection mongo DB established');
});

module.exports = mongoose;