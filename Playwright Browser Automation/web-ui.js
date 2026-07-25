const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Store progress logs in memory
let progressLogs = [];
let isCompleted = false;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/progress', (req, res) => {
  res.json({
    logs: progressLogs,
    completed: isCompleted
  });
});

app.post('/start-automation', async (req, res) => {
  const { username, password, keywords } = req.body;

  if (!username || !password || !keywords) {
    return res.status(400).json({ error: 'Username, password, and keywords are required' });
  }

  // Reset progress state
  progressLogs = [];
  isCompleted = false;

  // Convert keywords from textarea to array
  const keywordsArray = keywords.split('\n').map(k => k.trim()).filter(k => k);

  // Start automation in background
  runAutomation(username, password, keywordsArray);

  res.json({ message: 'Automation started' });
});

function addProgressLog(message, type = 'info') {
  progressLogs.push({ message, type, timestamp: new Date().toISOString() });
}

async function runAutomation(username, password, keywords) {
  try {
    addProgressLog('Starting automation...', 'info');
    addProgressLog(`Processing ${keywords.length} keyword(s)`, 'info');
    
    // Import and run the automation with progress callback and headless mode
    const { openDocumentSearch } = require('./dell-search-web');
    await openDocumentSearch(username, password, keywords, addProgressLog, true); // true = headless mode
    
    isCompleted = true;
    addProgressLog('Automation completed successfully!', 'success');
  } catch (error) {
    isCompleted = true;
    addProgressLog('Error: ' + error.message, 'error');
    console.error('Automation error:', error);
  }
}

app.listen(PORT, () => {
  console.log(`Dell Automation UI running at http://localhost:${PORT}`);
});
