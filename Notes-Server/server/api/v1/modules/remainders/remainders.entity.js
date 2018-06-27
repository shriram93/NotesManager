const mongoose = require('../connection/index').mongoose;

const remainderSchema = new mongoose.Schema({
  remainderId: { type: String, required: true },
  userId: { type: String, required: true},
  noteId : {type:String, required: true},
  remainderTime: {  type: Date, required: true},
  isDismissed: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now }
});
remainderSchema.index({userId:1,remainderId: 1},{unique:true});
module.exports = mongoose.model('remainder', remainderSchema);