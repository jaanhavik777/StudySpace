const mongoose = require('mongoose');
const StudySessionSchema = new mongoose.Schema({
  title:{type:String, required:true},
  description:{type:String, default:''},
  link:{type:String, default:''},
  notes:{type:String, default:''},
  hostEmail:{type:String, required:true}
},{ timestamps:true });
module.exports = mongoose.model('StudySession', StudySessionSchema);
