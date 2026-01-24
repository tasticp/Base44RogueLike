#!/usr/bin/env node

// Native test runner for Base44 Roguelike
const http = require('http');
const fs = require('fs');
const path = require('path');

const TEST_CONFIG = {
  serverUrl: 'http://localhost:3001',
  timeout: 5000,
  retries: 3
};

class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Starting Base44 Roguelike Test Suite\n');

    for (const test of this.tests) {
      try {
        console.log(`⏳ ${test.name}`);
        await Promise.race([
          test.testFn(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.timeout)
          )
        ]);
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Total: ${this.tests.length}`);
    
    process.exit(this.failed > 0 ? 1 : 0);
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (data) {
        options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
      }

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          let parsedBody = null;
          try {
            parsedBody = body ? JSON.parse(body) : null;
          } catch (error) {
            // If not JSON, return raw HTML/text
            parsedBody = body;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }
}

const runner = new TestRunner();

// Server availability test
runner.test('Server should be running', async () => {
  const response = await runner.makeRequest('/');
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  // Check if response contains HTML (since it's the main page)
  if (!response.body || !response.body.includes('<!DOCTYPE')) {
    throw new Error('Expected HTML response for main page');
  }
});

// CORS headers test
runner.test('CORS headers should be present', async () => {
  const response = await runner.makeRequest('/api/entities/GameSession');
  const headers = response.headers;
  
  if (!headers['access-control-allow-origin']) {
    throw new Error('CORS headers missing');
  }
});

// Game entities endpoint tests
runner.test('GET /api/entities/GameSession should return array', async () => {
  const response = await runner.makeRequest('/api/entities/GameSession');
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!Array.isArray(response.body)) {
    throw new Error('Expected array response');
  }
});

runner.test('POST /api/entities/GameSession should create entity', async () => {
  const newSession = {
    name: 'Test Session',
    player_name: 'Test Player',
    status: 'active'
  };
  
  const response = await runner.makeRequest('/api/entities/GameSession', 'POST', newSession);
  
  if (response.statusCode !== 201) {
    throw new Error(`Expected status 201, got ${response.statusCode}`);
  }
  
  if (!response.body.id) {
    throw new Error('Expected ID in response');
  }
  
  if (response.body.name !== newSession.name) {
    throw new Error('Session name mismatch');
  }
});

// Game action endpoints tests
runner.test('POST /api/game/test/combat should resolve combat', async () => {
  const combatAction = {
    action: 'attack',
    target: 'enemy_id'
  };
  
  const response = await runner.makeRequest('/api/game/test/combat', 'POST', combatAction);
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (typeof response.body.damage !== 'number') {
    throw new Error('Expected damage to be a number');
  }
});

runner.test('POST /api/game/test/trap should place trap', async () => {
  const trapAction = {
    action: 'place_trap',
    trapType: 'spike',
    position: { x: 10, y: 15 }
  };
  
  const response = await runner.makeRequest('/api/game/test/trap', 'POST', trapAction);
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Expected successful trap placement');
  }
});

runner.test('POST /api/game/test/exploration should handle exploration', async () => {
  const explorationAction = {
    action: 'explore',
    areaId: 'dungeon_1',
    roomId: 'room_5'
  };
  
  const response = await runner.makeRequest('/api/game/test/exploration', 'POST', explorationAction);
  
  if (response.statusCode !== 200) {
    throw new Error(`Expected status 200, got ${response.statusCode}`);
  }
  
  if (!response.body.success) {
    throw new Error('Expected successful exploration');
  }
});

// Error handling tests
runner.test('Invalid route should return 404', async () => {
  try {
    const response = await runner.makeRequest('/api/invalid/endpoint');
    if (response.statusCode !== 404) {
      throw new Error(`Expected status 404, got ${response.statusCode}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Server not running');
    }
    throw error;
  }
});

runner.test('Invalid JSON should return 400', async () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/entities/GameSession',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': 7
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 400) {
          reject(new Error(`Expected status 400, got ${res.statusCode}`));
        } else {
          resolve();
        }
      });
    });

    req.on('error', reject);
    req.write('invalid');
    req.end();
  });
});

// Performance test
runner.test('Server should respond within 100ms', async () => {
  const start = Date.now();
  await runner.makeRequest('/api/entities/GameSession');
  const duration = Date.now() - start;
  
  if (duration > 100) {
    throw new Error(`Response took ${duration}ms, expected < 100ms`);
  }
});

// Run all tests
runner.run().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});