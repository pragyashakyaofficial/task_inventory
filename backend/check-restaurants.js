require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Restaurant = require('./src/models/Restaurant');
  const restaurants = await Restaurant.find().select('name').lean();
  console.log('All restaurants in DB:');
  restaurants.forEach(r => console.log(' -', r._id, '|', r.name));
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
