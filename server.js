require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const crypto = require('crypto');

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

function calculateServerChecksum(score, mode, character, clientChecksum, pipesPassed, timestamp) {
    const secret = process.env.CHECKSUM_SECRET;
    const data = `${clientChecksum}|${score}|${mode}|${character}|${pipesPassed}|${timestamp}|${secret}`;
    return crypto.createHash('sha256').update(data).digest('hex');
}

function verifyChecksum(score, mode, character, clientChecksum, pipesPassed, timestamp) {
    // Recreate the client checksum
    const expectedClientChecksum = calculateClientChecksum(score, mode, character, pipesPassed);
    
    // Verify that the received client checksum matches the expected one
    if (clientChecksum !== expectedClientChecksum) {
        console.log('Client checksum mismatch');
        return false;
    }
    
    // Calculate and verify the server checksum
    const serverChecksum = calculateServerChecksum(score, mode, character, clientChecksum, pipesPassed, timestamp);
    console.log('Server checksum:', serverChecksum, 'Client checksum:', clientChecksum);
    
    // Verify timestamp is within an acceptable range (e.g., within the last 5 minutes)
    const currentTime = Date.now();
    const timeDifference = currentTime - timestamp;
    if (timeDifference < 0 || timeDifference > 5 * 60 * 1000) {
        console.log('Timestamp out of acceptable range');
        return false;
    }
    
    return true;
}

function calculateClientChecksum(score, mode, character, pipesPassed) {
    const data = `${score}|${mode}|${character}|${pipesPassed}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

// In the /api/scores endpoint, add some logging:
app.post('/api/scores', async (req, res) => {
    try {
        const { playerName, score, mode, character, clientChecksum, pipesPassed, timestamp } = req.body;
        
        console.log('Received score submission:', { playerName, score, mode, character, clientChecksum, pipesPassed, timestamp });

        // Verify score matches pipesPassed
        if (score !== pipesPassed) {
            console.log('Score does not match pipes passed');
            return res.status(400).json({ message: 'Invalid score submission' });
        }

        // Verify the checksum
        if (!verifyChecksum(score, mode, character, clientChecksum, pipesPassed, timestamp)) {
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
                pipesPassed,
                timestamp: new Date(timestamp) 
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
            startOfWeek.setHours(4, 0, 0, 0);
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

app.get('/api/repopulate-weekly-leaderboard/:mode', async (req, res) => {
  try {
    const { mode } = req.params;
    
    if (mode !== 'Normal' && mode !== 'Hard') {
      return res.status(400).json({ message: 'Invalid mode. Use "Normal" or "Hard".' });
    }

    // Calculate the start of the current week (Sunday at 4:00 AM server time)
    const startOfWeek = new Date();
    startOfWeek.setHours(4, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    console.log('Start of week:', startOfWeek);

    const query = { 
      mode: mode,
      timestamp: { $gte: startOfWeek }
    };

    console.log('Query:', JSON.stringify(query));

    const allScores = await collection.find({ mode: mode }).toArray();
    console.log(`All ${mode} scores:`, allScores);

    const leaderboard = await collection.find(query)
      .sort({ score: -1 })
      .limit(10)
      .project({ playerName: 1, score: 1, character: 1, timestamp: 1, _id: 0 })
      .toArray();

    console.log(`Repopulated ${mode} weekly leaderboard:`, leaderboard);

    res.json({ 
      message: `Weekly leaderboard for ${mode} mode repopulated`,
      leaderboard: leaderboard,
      allScores: allScores
    });
  } catch (error) {
    console.error('Error repopulating weekly leaderboard:', error);
    res.status(500).json({ message: 'Error repopulating weekly leaderboard' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));