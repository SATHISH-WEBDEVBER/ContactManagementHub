require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@cms.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const exists = await User.findOne({ email: adminEmail });
  if (exists) {
    console.log('⚠️  Admin already exists.');
    process.exit(0);
  }

  await User.create({
    name: 'System Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
  });

  console.log(`✅ Admin created: ${adminEmail}`);
  console.log('⚠️  CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
  process.exit(0);
};

seedAdmin();
