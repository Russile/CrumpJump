require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

// Submit score
app.post('/api/scores', async (req, res) => {
  try {
    const { playerName, score, mode } = req.body;
    const collection = client.db('crumpjump').collection('scores');
    await collection.insertOne({ playerName, score, mode, timestamp: new Date() });
    res.status(201).json({ message: 'Score submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting score' });
  }
});

// Get leaderboard
app.get('/api/leaderboard/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    const collection = client.db('crumpjump').collection('scores');
    const leaderboard = await collection.find({ mode })
      .sort({ score: -1 })
      .limit(10)
      .toArray();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));