const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
  prompt: { type: String, required: true },
  response: { type: String },
  rawResponse: { type: String },
  parsedResponse: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prompt', promptSchema);
