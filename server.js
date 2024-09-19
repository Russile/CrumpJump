require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let collection; // Declare the collection variable

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const database = client.db('crumpjump'); 
    collection = database.collection('scores'); // Initialize the collection
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

// Submit score
app.post('/api/scores', async (req, res) => {
  try {
      const { playerName, score, mode, character, configurationId, pipeConfiguration } = req.body;
      
      if (score > 1) {
          await collection.insertOne({ 
              playerName, 
              score, 
              mode, 
              character, 
              configurationId,
              pipeConfiguration, // Store the full configuration
              timestamp: new Date() 
          });
          res.status(201).json({ message: 'Score submitted successfully' });
      } else {
          res.status(400).json({ message: 'Score must be greater than 1' });
      }
  } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({ message: 'Error submitting score' });
  }
});

// Get leaderboard (handles both overall and weekly, and supports old client requests)
app.get('/api/leaderboard/:mode/:type?', async (req, res) => {
  try {
      const { mode, type } = req.params;
      let query = { mode };
      let sort = { score: -1 };

      // If type is not provided (old client request), default to overall
      const leaderboardType = type || 'overall';

      if (leaderboardType === 'weekly') {
          // Calculate the start of the current week (Sunday)
          const startOfWeek = new Date();
          startOfWeek.setHours(0, 0, 0, 0);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

          query.timestamp = { $gte: startOfWeek };
      }

      const leaderboard = await collection.find(query)
          .sort(sort)
          .limit(10)
          .project({ playerName: 1, score: 1, character: 1, timestamp: 1, _id: 0 })
          .toArray();

      res.json(leaderboard);
  } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));