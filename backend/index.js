const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// load environment variables from .env when present
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// enable CORS - development mode (allow all origins)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

// Add event listeners for mongoose connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
});

mongoose.connection.on('connected', () => {
  console.log('Successfully connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
  console.log('MongoDB connection state:', mongoose.connection.readyState);
  
  // List all collections
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error('Error listing collections:', err);
    } else {
      console.log('Available collections:', collections.map(c => c.name));
    }
  });
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

// Attempt to connect
mongoose.connect(MONGO_URI)
  .catch((err) => {
    console.error('Initial MongoDB connection error:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  });

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
