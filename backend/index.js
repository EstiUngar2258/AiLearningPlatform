const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// load environment variables from .env when present
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// enable CORS for local development
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://esti0534162258:325451193@estihalperin.ft3uavb.mongodb.net/AI_Learning?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('AI Learning Backend is running!');
});

// API routes
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const customersRouter = require('./routes/customers');
app.use('/api/customers', customersRouter);

const categoriesRouter = require('./routes/categories');
app.use('/api/categories', categoriesRouter);

const subcategoriesRouter = require('./routes/subcategories');
app.use('/api/subcategories', subcategoriesRouter);

const promptsRouter = require('./routes/prompts');
app.use('/api/prompts', promptsRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
