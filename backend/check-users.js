require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./src/models/User');
  const users = await User.find().select('email role status').lean();
  console.log('All users in DB:');
  users.forEach(u => console.log(' -', u.email, '|', u.role, '|', u.status));
  await mongoose.disconnect();
  process.exit(0);
}).catch(e => { console.error(e); process.exit(1); });
