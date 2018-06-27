const mongoose = require('../connection/index').mongoose;
const bcrypt = require('bcrypt');

const validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const UserSchema = new mongoose.Schema({
  userId: { type:String, require:true},
  name: { type : String, require:true},
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: [validateEmail, 'Invalid email']
  },
  password: {
    type: String,
    required: true,
  }
});

UserSchema.index({email: 1},{unique:true});

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
  });

const User = mongoose.model('User', UserSchema);
module.exports = User;