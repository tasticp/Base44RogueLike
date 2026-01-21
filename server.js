const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory database (replace with real database in production)
const gameData = {
  sessions: {},
  objects: {},
  adminActions: {},
  profiles: {}
};

// Mock Base44 API endpoints
app.get('/api/entities/:entityType', (req, res) => {
  const { entityType } = req.params;
  const { session_id } = req.query;
  
  let results = [];
  
  switch(entityType) {
    case 'GameSession':
      results = Object.values(gameData.sessions);
      break;
    case 'GameObject':
      results = session_id ? Object.values(gameData.objects).filter(obj => obj.session_id === session_id) : Object.values(gameData.objects);
      break;
    case 'AdminAction':
      results = session_id ? Object.values(gameData.adminActions).filter(action => action.session_id === session_id) : Object.values(gameData.adminActions);
      break;
    case 'PlayerProfile':
      results = Object.values(gameData.profiles);
      break;
  }
  
  res.json(results);
});

app.post('/api/entities/:entityType', (req, res) => {
  const { entityType } = req.params;
  const id = uuidv4();
  const newEntity = { id, ...req.body, created_at: new Date().toISOString() };
  
  switch(entityType) {
    case 'GameSession':
      gameData.sessions[id] = newEntity;
      break;
    case 'GameObject':
      gameData.objects[id] = newEntity;
      break;
    case 'AdminAction':
      gameData.adminActions[id] = newEntity;
      break;
    case 'PlayerProfile':
      gameData.profiles[id] = newEntity;
      break;
  }
  
  res.json(newEntity);
});

app.get('/api/entities/:entityType/:id', (req, res) => {
  const { entityType, id } = req.params;
  
  let entity;
  switch(entityType) {
    case 'GameSession':
      entity = gameData.sessions[id];
      break;
    case 'GameObject':
      entity = gameData.objects[id];
      break;
    case 'AdminAction':
      entity = gameData.adminActions[id];
      break;
    case 'PlayerProfile':
      entity = gameData.profiles[id];
      break;
  }
  
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found' });
  }
  
  res.json(entity);
});

app.put('/api/entities/:entityType/:id', (req, res) => {
  const { entityType, id } = req.params;
  const updates = { ...req.body, updated_at: new Date().toISOString() };
  
  let entity;
  switch(entityType) {
    case 'GameSession':
      entity = { ...gameData.sessions[id], ...updates };
      gameData.sessions[id] = entity;
      break;
    case 'GameObject':
      entity = { ...gameData.objects[id], ...updates };
      gameData.objects[id] = entity;
      break;
    case 'AdminAction':
      entity = { ...gameData.adminActions[id], ...updates };
      gameData.adminActions[id] = entity;
      break;
    case 'PlayerProfile':
      entity = { ...gameData.profiles[id], ...updates };
      gameData.profiles[id] = entity;
      break;
  }
  
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found' });
  }
  
  res.json(entity);
});

// Utility endpoints for game actions
app.post('/api/game/:sessionId/combat', (req, res) => {
  const { sessionId } = req.params;
  const { action, target } = req.body;
  
  // Mock combat resolution
  const result = {
    success: true,
    damage: Math.floor(Math.random() * 50) + 10,
    message: `Combat action ${action} executed successfully`
  };
  
  res.json(result);
});

app.post('/api/game/:sessionId/trap', (req, res) => {
  const { sessionId } = req.params;
  const { action, trapType, position, trapId } = req.body;
  
  // Mock trap action resolution
  const result = {
    success: true,
    message: `Trap action ${action} executed successfully`
  };
  
  if (action === 'place_trap') {
    // Add new trap to game objects
    const trapId = uuidv4();
    gameData.objects[trapId] = {
      id: trapId,
      session_id: sessionId,
      object_type: 'trap',
      position,
      state: 'active',
      damage: 25,
      trap_type: trapType
    };
  }
  
  res.json(result);
});

app.post('/api/game/:sessionId/resource', (req, res) => {
  const { sessionId } = req.params;
  const { action, recipeId, shopId, itemId } = req.body;
  
  // Mock resource action resolution
  const result = {
    success: true,
    message: `Resource action ${action} executed successfully`
  };
  
  res.json(result);
});

app.post('/api/game/:sessionId/exploration', (req, res) => {
  const { sessionId } = req.params;
  const { action, areaId, roomId } = req.body;
  
  // Mock exploration action resolution
  const result = {
    success: true,
    message: `Exploration action ${action} executed successfully`,
    discovery: Math.random() > 0.7 ? {
      id: 'ancient_scroll',
      name: 'Ancient Scroll',
      description: 'A scroll containing forgotten knowledge',
      rarity: 'rare'
    } : null
  };
  
  res.json(result);
});

app.post('/api/game/:sessionId/progression', (req, res) => {
  const { sessionId } = req.params;
  const { action, amount, skillId, abilityId, role } = req.body;
  
  // Mock progression action resolution
  const result = {
    success: true,
    message: `Progression action ${action} executed successfully`
  };
  
  res.json(result);
});

// Serve the main game page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Pages', 'Dashboard'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Base44 Roguelike Server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
  console.log(`🎯 Game Features: Combat, Traps, Resources, Exploration, Progression`);
});