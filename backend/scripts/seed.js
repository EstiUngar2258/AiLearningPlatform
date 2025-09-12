"use strict";
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Prompt = require('../models/Prompt');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set in backend/.env');
  process.exit(1);
}

async function seed() {
  try {
  await mongoose.connect(MONGO_URI, { connectTimeoutMS: 10000 });
    console.log('Connected to MongoDB');

    // Password hash for demo users
    const plainPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    // 1) Upsert 10 demo users
    const demoUsers = Array.from({ length: 10 }).map((_, i) => ({
      name: `Demo User ${i + 1}`,
      email: `demo.user${i + 1}@example.com`,
      phone: `+9725${String(1000000 + i).slice(-7)}`,
      password: passwordHash
    }));

    for (const u of demoUsers) {
      await User.updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }

    const users = await User.find({ email: { $in: demoUsers.map(d => d.email) } }).lean();
    console.log('Users upserted:', users.map(u => ({ _id: u._id.toString(), email: u.email })));

    // 2) Customers (clear and insert sample customers)
    const sampleCustomers = [
      { name: 'Alon Cohen', phone: '+972501234560' },
      { name: 'Maya Levi', phone: '+972502345671' },
      { name: 'Ori Katz', phone: '+972503456782' },
      { name: 'Dana Abramov', phone: '+972504567893' },
      { name: 'Yossi Ben', phone: '+972505678904' },
      { name: 'Noa Shiran', phone: '+972506789015' }
    ];

    await Customer.deleteMany({});
    const insertedCustomers = await Customer.insertMany(sampleCustomers);
    console.log('Customers inserted:', insertedCustomers.map(c => c.name));

    // 3) Categories
    const categoriesData = ['Math', 'Programming', 'Science', 'History', 'Languages', 'Art', 'Geography'];
    await Category.deleteMany({});
    const insertedCategories = await Category.insertMany(categoriesData.map(n => ({ name: n })));
    console.log('Categories inserted:', insertedCategories.map(c => c.name));

    // 4) Subcategories
    await SubCategory.deleteMany({});
    const catMap = {};
    insertedCategories.forEach(c => { catMap[c.name] = c._id; });

    const subsData = [
      { name: 'Algebra', category: 'Math' },
      { name: 'Calculus', category: 'Math' },
      { name: 'Linear Algebra', category: 'Math' },
      { name: 'JavaScript', category: 'Programming' },
      { name: 'Python', category: 'Programming' },
      { name: 'React', category: 'Programming' },
      { name: 'Physics', category: 'Science' },
      { name: 'Biology', category: 'Science' },
      { name: 'Ancient History', category: 'History' },
      { name: 'Modern History', category: 'History' },
      { name: 'English', category: 'Languages' },
      { name: 'Hebrew', category: 'Languages' },
      { name: 'Painting', category: 'Art' },
      { name: 'Music', category: 'Art' },
      { name: 'Maps & Coordinates', category: 'Geography' }
    ];

    const subsToInsert = subsData.map(s => ({ name: s.name, category: catMap[s.category] }));
    const insertedSubs = await SubCategory.insertMany(subsToInsert);
    console.log('Subcategories inserted:', insertedSubs.map(s => s.name));

    // 5) Sample prompts (clear and insert)
    await Prompt.deleteMany({});

    // choose some users for sample prompts (use available users length safe check)
    const u0 = users[0]?._id;
    const u1 = users[1]?._id;
    const u2 = users[2]?._id;
    const u3 = users[3]?._id;
    const u4 = users[4]?._id;
    const u5 = users[5]?._id;

    const findSub = name => insertedSubs.find(s => s.name === name)?._id;
    const findCat = name => insertedCategories.find(c => c.name === name)?._id;

    const samplePrompts = [];
    if (u0) samplePrompts.push({ user: u0, category: findCat('Programming'), subCategory: findSub('JavaScript'), prompt: 'How to use map in JavaScript?', rawResponse: 'Use Array.prototype.map to transform arrays into new arrays. Example:\n\n```js\nconst nums = [1,2,3];\nconst doubled = nums.map(n => n*2);\n```' });
    if (u1) samplePrompts.push({ user: u1, category: findCat('Math'), subCategory: findSub('Algebra'), prompt: 'What is a linear equation?', rawResponse: 'A linear equation is an equation between two variables that gives a straight line when plotted on a graph. General form: ax + b = 0.' });
    if (u2) samplePrompts.push({ user: u2, category: findCat('Science'), subCategory: findSub('Physics'), prompt: 'מה זה חוק גאוס?', rawResponse: 'חוק גאוס עוסק בשטף של שדות חשמליים ומתח אלקטרוסטטי וקשור למטען הכלוא בשטח סגור.' });
    if (u3) samplePrompts.push({ user: u3, category: findCat('History'), subCategory: findSub('Modern History'), prompt: 'מהן המהפכות התעשייתיות?', rawResponse: 'המהפכה התעשייתית הייתה מעבר לטכנולוגיות ייצור מתקדמות במאות ה-18 וה-19, שינויי עבודה ומבנה חברתי.' });
    if (u4) samplePrompts.push({ user: u4, category: findCat('Languages'), subCategory: findSub('English'), prompt: 'How to improve English vocabulary?', rawResponse: 'Read daily, write new words in context, and practice with spaced repetition.' });
    if (u5) samplePrompts.push({ user: u5, category: findCat('Art'), subCategory: findSub('Painting'), prompt: 'איך להתחיל לצייר בצבעי שמן?', rawResponse: 'התחל עם סגנון פשוט, למד טכניקות ערבוב צבעים ועבודה בשכבות.' });

    if (samplePrompts.length > 0) {
      const inserted = await Prompt.insertMany(samplePrompts);
      console.log('Sample prompts inserted:', inserted.map(p => ({ _id: p._id.toString(), user: p.user.toString() })));
    } else {
      console.log('No sample prompts were created because not enough users were found.');
    }

    console.log('Seeding complete.');

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
