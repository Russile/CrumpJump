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

// Replace the existing calculateServerChecksum and verifyChecksum functions with these:

function calculateServerChecksum(score, mode, character) {
    const data = `${score}|${mode}|${character}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

function verifyChecksum(score, mode, character, clientChecksum) {
    const serverChecksum = calculateServerChecksum(score, mode, character);
    console.log('Server checksum:', serverChecksum, 'Client checksum:', clientChecksum);
    return serverChecksum === clientChecksum;
}

// In the /api/scores endpoint, add some logging:
app.post('/api/scores', async (req, res) => {
    try {
        const { playerName, score, mode, character, clientChecksum, configurationId, pipeConfiguration } = req.body;
        
        console.log('Received score submission:', { score, mode, character, clientChecksum });

        // Verify the checksum
        if (!verifyChecksum(score, mode, character, clientChecksum)) {
            console.log('Checksum verification failed');
            return res.status(400).json({ message: 'Invalid checksum' });
        }

        console.log('Checksum verification passed');

        // Define maximum possible score based on game logic
        const MAX_POSSIBLE_SCORE = 147; // Adjust this value based on your game's mechanics
        
        if (score > 1 && score <= MAX_POSSIBLE_SCORE) {
            await collection.insertOne({ 
                playerName, 
                score, 
                mode, 
                character,
                configurationId,
                pipeConfiguration,
                timestamp: new Date() 
            });
            res.status(201).json({ message: 'Score submitted successfully' });
        } else {
            res.status(400).json({ message: 'Invalid score' });
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