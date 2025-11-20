const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://your-connection-string';

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Content-Type', 'image/jpeg');
  }
}));

app.use('/images', (req, res, next) => {
  res.status(404).json({ error: 'Image not found' });
});

let db;
let client;

async function connectDB() {
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('your-connection-string')) {
      throw new Error('MongoDB connection string is not set. Please set MONGO_URI or MONGODB_URI environment variable.');
    }

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000
    };

    console.log('Attempting to connect to MongoDB Atlas...');
    console.log('Connection string format:', MONGODB_URI ? 'Set' : 'Missing');
    
    client = new MongoClient(MONGODB_URI, options);
    
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    
    db = client.db('afterSchoolClasses');
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    await initializeSampleData();
  }
}

async function initializeSampleData() {
  try {
    const lessonsCollection = db.collection('lessons');
    const count = await lessonsCollection.countDocuments();
    
    if (count === 0) {
      const sampleLessons = [
        { subject: 'Mathematics', location: 'London', price: 100, space: 5, icon: 'fa-calculator' },
        { subject: 'English Literature', location: 'Manchester', price: 90, space: 8, icon: 'fa-book' },
        { subject: 'Science', location: 'London', price: 110, space: 3, icon: 'fa-flask' },
        { subject: 'Art & Design', location: 'Birmingham', price: 85, space: 10, icon: 'fa-palette' },
        { subject: 'Music', location: 'London', price: 95, space: 6, icon: 'fa-music' },
        { subject: 'Physical Education', location: 'Leeds', price: 75, space: 12, icon: 'fa-football-ball' },
        { subject: 'Computer Science', location: 'Manchester', price: 120, space: 4, icon: 'fa-laptop-code' },
        { subject: 'History', location: 'Birmingham', price: 80, space: 7, icon: 'fa-landmark' },
        { subject: 'Geography', location: 'London', price: 85, space: 9, icon: 'fa-globe' },
        { subject: 'French Language', location: 'Manchester', price: 95, space: 5, icon: 'fa-language' },
        { subject: 'Drama', location: 'Leeds', price: 88, space: 6, icon: 'fa-theater-masks' },
        { subject: 'Cooking', location: 'London', price: 105, space: 4, icon: 'fa-utensils' }
      ];
      
      await lessonsCollection.insertMany(sampleLessons);
      console.log('Sample lessons data initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

app.get('/lessons', async (req, res) => {
  try {
    const lessonsCollection = db.collection('lessons');
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = (req.query.query || '').trim();
    const lessonsCollection = db.collection('lessons');
    
    console.log('Search request received. Query:', query);
    
    if (!query) {
      console.log('Empty query - returning all lessons');
      const allLessons = await lessonsCollection.find({}).toArray();
      return res.json(allLessons);
    }
    
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    const searchRegex = new RegExp(escapedQuery, 'i');
    console.log('Search regex:', searchRegex.toString());
    
    const queryNumber = parseFloat(query);
    const queryInt = parseInt(query);
    const isNumericQuery = !isNaN(queryNumber) && query.trim() === queryNumber.toString();
    const isIntQuery = !isNaN(queryInt) && query.trim() === queryInt.toString();
    
    const searchConditions = {
      $or: [
        { subject: { $regex: searchRegex } },
        { location: { $regex: searchRegex } }
      ]
    };
    
    if (isNumericQuery) {
      searchConditions.$or.push({ price: queryNumber });
    }
    if (isIntQuery) {
      searchConditions.$or.push({ space: queryInt });
    }
    
    console.log('Search conditions:', JSON.stringify(searchConditions, null, 2));
    
    const lessons = await lessonsCollection.find(searchConditions).toArray();
    
    console.log('Search results:', lessons.length, 'lessons found');
    if (lessons.length > 0) {
      console.log('First result subject:', lessons[0].subject);
    }
    
    res.json(lessons);
  } catch (error) {
    console.error('Error searching lessons:', error);
    res.status(500).json({ error: 'Failed to search lessons' });
  }
});

app.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid lesson ID format' });
    }
    
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    const lessonsCollection = db.collection('lessons');
    
    const updateFields = { ...req.body };
    
    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    res.json({ message: 'Lesson availability updated successfully' });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { name, phone, lessons } = req.body;
    
    if (!name || !phone || !lessons || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ error: 'Invalid order data' });
    }
    
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ error: 'Name must contain only letters' });
    }
    
    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must contain only numbers' });
    }
    
    const ordersCollection = db.collection('orders');
    const lessonsCollection = db.collection('lessons');
    
    
      
      orderLessons.push({
        id: lessonItem.id,
        subject: lesson.subject,
        quantity: lessonItem.quantity
      });
    }
    
    const order = {
      name,
      phone,
      lessons: orderLessons,
      createdAt: new Date()
    };
    
    const result = await ordersCollection.insertOne(order);
    order._id = result.insertedId;
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

startServer();


