const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['manual_trigger', 'ir_proximity', 'combined_danger']
  },
  status: {
    type: String,
    enum: ['active', 'solved'],
    default: 'active'
  },
  location: {
    latitude:  { type: Number, required: true },
    longitude: { type: Number, required: true },
    address:   { type: String, trim: true }
  },
  deviceId:    { type: String, required: true, trim: true },
  description: { type: String, trim: true, maxlength: 500 },
  notes: [{
    text:      { type: String, required: true, maxlength: 1000 },
    author:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  solvedAt:  { type: Date },
  solvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

alertSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ type: 1 });

module.exports = mongoose.model('Alert', alertSchema);
