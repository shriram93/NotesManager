const mongoose = require('../connection/index').mongoose;

const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true },
  userId: { type: String, required: true},
  permission: {type:String, required:true},
  title: { type: String, required: true },
  content: { type: String, default: '' },
  sharedNotes : [{
      noteId: {type : String},
      userId: {type: String},
      permission : { type:String}
  }],
  parentNoteId : {type:String, default: ''},
  groupId: { type: String , default: ''},
  remainderId: { type: String , default: ''},
  favorite: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now }
});
noteSchema.index({noteId:1,userId: 1},{unique:true});
module.exports = mongoose.model('notes', noteSchema);