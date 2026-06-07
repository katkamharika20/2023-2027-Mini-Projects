const mongoose = require('mongoose');

const guidelineSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String,
    enum: ['general', 'emergency', 'prevention', 'reporting'],
    default: 'general'
  },
  author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:  { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Guideline', guidelineSchema);
