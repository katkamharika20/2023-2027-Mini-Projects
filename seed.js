require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Alert = require('./models/Alert');
const Guideline = require('./models/Guideline');

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/police-dashboard");
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Alert.deleteMany({});
  await Guideline.deleteMany({});

  // Create users
  const admin = await User.create({
    username: 'admin', email: 'admin@police.gov',
    password: 'admin123', role: 'admin', fullName: 'Chief Admin', badge: 'ADM-001'
  });
  const officer = await User.create({
    username: 'officer1', email: 'officer1@police.gov',
    password: 'officer123', role: 'police', fullName: 'Officer Smith', badge: 'POL-101'
  });
  await User.create({
    username: 'citizen', email: 'citizen@example.com',
    password: 'citizen123', role: 'user', fullName: 'Jane Citizen'
  });

  // Create sample alerts
  const alertData = [
    { type: 'manual_trigger', location: { latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, New Delhi' }, deviceId: 'DEV-001', description: 'Manual SOS triggered near metro station' },
    { type: 'ir_proximity', location: { latitude: 28.6329, longitude: 77.2195, address: 'Chandni Chowk, Delhi' }, deviceId: 'DEV-002', description: 'IR sensor proximity breach detected' },
    { type: 'combined_danger', location: { latitude: 28.5535, longitude: 77.2588, address: 'Nehru Place, Delhi' }, deviceId: 'DEV-003', description: 'Combined danger: Manual + IR triggered simultaneously' },
    { type: 'manual_trigger', location: { latitude: 28.6280, longitude: 77.2149, address: 'Red Fort, Delhi' }, deviceId: 'DEV-004', description: 'Panic button pressed', status: 'solved', solvedBy: officer._id, solvedAt: new Date() },
    { type: 'ir_proximity', location: { latitude: 28.6105, longitude: 77.2303, address: 'India Gate, Delhi' }, deviceId: 'DEV-005', description: 'Multiple IR breaches in 2 minutes' },
  ];
  const alerts = await Alert.insertMany(alertData);

  // Add notes to first alert
  await Alert.findByIdAndUpdate(alerts[0]._id, {
    $push: { notes: { text: 'Patrol unit dispatched to location.', author: officer._id } }
  });

  // Create guidelines
  await Guideline.insertMany([
    { title: 'Emergency SOS Procedure', content: 'If you receive a manual trigger alert, immediately dispatch the nearest patrol unit. Verify the alert by contacting the device owner. Secure the area within a 200m radius.', category: 'emergency', author: admin._id },
    { title: 'How to Report Suspicious Activity', content: 'Citizens should report suspicious activity through the official app or by calling the emergency hotline. Provide location, description, and time of observation.', category: 'reporting', author: admin._id },
    { title: 'Night Safety Guidelines', content: 'Avoid poorly lit areas. Travel in groups when possible. Keep emergency contacts readily accessible. Ensure your safety device is charged and operational.', category: 'prevention', author: admin._id },
  ]);

  console.log('Seed complete! Accounts:\n  admin/admin123 (Admin)\n  officer1/officer123 (Police)\n  citizen/citizen123 (User)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
