const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    subject: { type: String, default: '' },  
    uploadedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', ResourceSchema);
