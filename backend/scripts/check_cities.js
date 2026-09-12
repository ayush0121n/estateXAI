require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property');
const PG = require('../models/PG');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const propCities = await Property.aggregate([{ $group: { _id: '$location.city', count: { $sum: 1 } } }]);
  const pgCities = await PG.aggregate([{ $group: { _id: '$location.city', count: { $sum: 1 } } }]);
  console.log('PROPERTY CITIES:', JSON.stringify(propCities, null, 2));
  console.log('PG CITIES:', JSON.stringify(pgCities, null, 2));
  
  const allPGsCount = await PG.countDocuments();
  const availablePGsCount = await PG.countDocuments({ isAvailable: true });
  console.log('ALL PGs count:', allPGsCount, 'Available PGs count:', availablePGsCount);

  const samplePGs = await PG.find().limit(3).select('name location isAvailable isFeatured genderType rentPerMonth');
  console.log('SAMPLE PGs:', JSON.stringify(samplePGs, null, 2));
  
  process.exit(0);
}
check().catch(console.error);
