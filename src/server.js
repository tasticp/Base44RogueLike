const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const PORT = process.env.PORT || 3001;

// In-memory database (replace with real database in production)
const gameData = {
  sessions: {},
  objects: {},
  adminActions: {},
  profiles: {}
};

// Native CORS middleware
function addCORSHeaders(res, origin) {
  // If a specific origin is provided (e.g. from req.headers.origin), echo it back
  // and allow credentials. Otherwise, fall back to a wildcard origin without
  // credentials to remain CORS-spec compliant.
  if (origin && origin !== '*') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  } else if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 MB

// Native JSON parser with basic body size limit
function parseJSON(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let exceeded = false;

    req.on('data', chunk => {
      if (exceeded) {
        return;
      }

      body += chunk.toString();

      if (body.length > MAX_BODY_SIZE) {
        exceeded = true;
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (exceeded) {
        return;
      }

      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

// Native UUID generator
function generateUUID() {
  return crypto.randomUUID();
}

// Native file serving with basic containment and extension allowlist
function serveStaticFile(filePath, res, contentType = 'text/html') {
  const rootDir = path.resolve(__dirname, '..');
  const fullPath = path.resolve(rootDir, filePath);

  // Prevent path traversal outside the allowed root directory
  if (!fullPath.startsWith(rootDir + path.sep) && fullPath !== rootDir) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }

  const allowedExts = new Set([
    '.html',
    '.css',
    '.js',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.ico'
  ]);

  const ext = path.extname(fullPath);
  if (ext && !allowedExts.has(ext)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File not found' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Mock Base44 API endpoints - GET entities
function handleGetEntities(req, res, pathname) {
  const urlParts = pathname.split('/');
  const entityType = urlParts[3];
  const queryParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const session_id = queryParams.get('session_id');
  
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
  
  addCORSHeaders(res);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(results));
}

// POST entities
async function handlePostEntities(req, res, pathname) {
  const urlParts = pathname.split('/');
  const entityType = urlParts[3];
  const id = generateUUID();
  
  try {
    const body = await parseJSON(req);
    const newEntity = { id, ...body, created_at: new Date().toISOString() };
    
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
    
    addCORSHeaders(res);
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newEntity));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// GET entity by ID
function handleGetEntityById(req, res, pathname) {
  const urlParts = pathname.split('/');
  const entityType = urlParts[3];
  const id = urlParts[4];
  
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
  
  addCORSHeaders(res);
  
  if (!entity) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Entity not found' }));
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(entity));
}

// PUT entity by ID
async function handlePutEntityById(req, res, pathname) {
  const urlParts = pathname.split('/');
  const entityType = urlParts[3];
  const id = urlParts[4];

  try {
    const body = await parseJSON(req);
    const updates = { ...body, updated_at: new Date().toISOString() };

    const store = {
      GameSession: gameData.sessions,
      GameObject: gameData.objects,
      AdminAction: gameData.adminActions,
      PlayerProfile: gameData.profiles
    }[entityType];

    // If the store or entity does not exist, return 404 instead of upserting
    if (!store || !store[id]) {
      addCORSHeaders(res);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Entity not found' }));
      return;
    }

    store[id] = { ...store[id], ...updates };
    const entity = store[id];

    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(entity));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Utility endpoints for game actions - Combat
async function handleCombat(req, res, pathname) {
  const urlParts = pathname.split('/');
  const sessionId = urlParts[3];
  
  try {
    const body = await parseJSON(req);
    const { action, target } = body;
    
    // Mock combat resolution
    const result = {
      success: true,
      damage: Math.floor(Math.random() * 50) + 10,
      message: `Combat action ${action} executed successfully`
    };
    
    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Trap actions
async function handleTrap(req, res, pathname) {
  const urlParts = pathname.split('/');
  const sessionId = urlParts[3];
  
  try {
    const body = await parseJSON(req);
    const { action, trapType, position } = body;
    
    // Mock trap action resolution
    const result = {
      success: true,
      message: `Trap action ${action} executed successfully`
    };
    
    if (action === 'place_trap') {
      // Add new trap to game objects
      const trapId = generateUUID();
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
    
    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Resource actions
async function handleResource(req, res, pathname) {
  const urlParts = pathname.split('/');
  const sessionId = urlParts[3];
  
  try {
    const body = await parseJSON(req);
    const { action, recipeId, shopId, itemId } = body;
    
    // Mock resource action resolution
    const result = {
      success: true,
      message: `Resource action ${action} executed successfully`
    };
    
    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Exploration actions
async function handleExploration(req, res, pathname) {
  const urlParts = pathname.split('/');
  const sessionId = urlParts[3];
  
  try {
    const body = await parseJSON(req);
    const { action, areaId, roomId } = body;
    
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
    
    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Progression actions
async function handleProgression(req, res, pathname) {
  const urlParts = pathname.split('/');
  const sessionId = urlParts[3];
  
  try {
    const body = await parseJSON(req);
    const { action, amount, skillId, abilityId, role } = body;
    
    // Mock progression action resolution
    const result = {
      success: true,
      message: `Progression action ${action} executed successfully`
    };
    
    addCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  } catch (error) {
    addCORSHeaders(res);
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
  }
}

// Route handler
function routeHandler(req, res) {
  const method = req.method;
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  // Debug logging
  console.log(`${method} ${pathname}`);

  // Apply CORS headers once per request, using the Origin header when present
  addCORSHeaders(res, req.headers.origin);

  // Handle OPTIONS for CORS
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API routes first (to avoid conflicts with static files)
  if (pathname.startsWith('/api/entities/')) {
    if (method === 'GET' && pathname.split('/').length === 4) {
      return handleGetEntities(req, res, pathname);
    }
    if (method === 'POST' && pathname.split('/').length === 4) {
      return handlePostEntities(req, res, pathname);
    }
    if (method === 'GET' && pathname.split('/').length === 5) {
      return handleGetEntityById(req, res, pathname);
    }
    if (method === 'PUT' && pathname.split('/').length === 5) {
      return handlePutEntityById(req, res, pathname);
    }
  }
  
  if (pathname.startsWith('/api/game/') && pathname.endsWith('/combat')) {
    if (method === 'POST') {
      return handleCombat(req, res, pathname);
    }
  }
  
  if (pathname.startsWith('/api/game/') && pathname.endsWith('/trap')) {
    if (method === 'POST') {
      return handleTrap(req, res, pathname);
    }
  }
  
  if (pathname.startsWith('/api/game/') && pathname.endsWith('/resource')) {
    if (method === 'POST') {
      return handleResource(req, res, pathname);
    }
  }
  
  if (pathname.startsWith('/api/game/') && pathname.endsWith('/exploration')) {
    if (method === 'POST') {
      return handleExploration(req, res, pathname);
    }
  }
  
  if (pathname.startsWith('/api/game/') && pathname.endsWith('/progression')) {
    if (method === 'POST') {
      return handleProgression(req, res, pathname);
    }
  }
  
  // Main page
  if (method === 'GET' && pathname === '/') {
    serveStaticFile('index.html', res);
    return;
  }
  
  // Static files (non-API routes)
  if (method === 'GET' && !pathname.startsWith('/api/')) {
    let filePath = pathname === '/' ? 'index.html' : pathname.substring(1);
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    // If no extension, try .html file
    if (ext === '') {
      filePath = filePath + '.html';
    }

    // Determine content type
    switch(path.extname(filePath)) {
      case '.css': contentType = 'text/css'; break;
      case '.js': contentType = 'application/javascript'; break;
      case '.json': contentType = 'application/json'; break;
      case '.png': contentType = 'image/png'; break;
      case '.jpg': contentType = 'image/jpeg'; break;
      case '.svg': contentType = 'image/svg+xml'; break;
      case '.html': contentType = 'text/html'; break;
    }

    serveStaticFile(filePath, res, contentType);
    return;
  }
  
  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
}

// Create and start server
const server = http.createServer(routeHandler);

server.listen(PORT, () => {
  console.log(`🎮 Base44 Roguelike Server running on http://localhost:${PORT}`);
  console.log(`📱 Open your browser and navigate to http://localhost:${PORT}`);
  console.log(`🎯 Game Features: Combat, Traps, Resources, Exploration, Progression`);
  console.log(`🚀 Native implementation - Zero external dependencies!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
