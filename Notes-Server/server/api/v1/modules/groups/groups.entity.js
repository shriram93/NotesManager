const mongoose = require('../connection/index').mongoose;

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, default: 'untitled' , required: true },
  description: { type: String, default: '' },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
  notes: [{}]
});

groupSchema.index({groupId: 1, userId:1},{unique:true});
module.exports = mongoose.model('group', groupSchema);