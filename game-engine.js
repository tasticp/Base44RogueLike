/**
 * NPC Dungeon - Pixel Art Game Engine
 * Turn-based dungeon crawler with grid-based movement
 */

class GameEngine {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.tileSize = 32;
        this.gridWidth = 16;
        this.gridHeight = 16;
        
        // Game state
        this.turn = 1;
        this.isPlayerTurn = true;
        this.gameRunning = true;
        
        // Player
        this.player = {
            x: 8,
            y: 8,
            hp: 100,
            maxHp: 100,
            mana: 50,
            maxMana: 100,
            level: 1,
            exp: 0,
            gold: 150,
            inventory: [
                { id: 'potion', name: 'Health Potion', count: 3, icon: '🧪' },
                { id: 'trap_spike', name: 'Spike Trap', count: 5, icon: '🎯' },
                { id: 'trap_fire', name: 'Fire Trap', count: 2, icon: '🔥' },
            ],
        };
        
        // Entities
        this.grid = [];
        this.enemies = [];
        this.items = [];
        this.npcs = [];
        this.traps = [];
        
        this.messageLog = [];
        this.selectedAction = null;
        
        this.initializeLevel();
    }
    
    initializeLevel() {
        // Create tile grid
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // Perimeter walls
                let isWall = x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1;
                // Random interior walls (10% chance)
                if (!isWall && Math.random() < 0.08) isWall = true;
                this.grid[y][x] = isWall ? 'wall' : 'floor';
            }
        }
        
        // Clear player area
        this.grid[8][8] = 'floor';
        
        // Spawn enemies
        this.enemies = [
            this.createEnemy(2, 2, 'goblin'),
            this.createEnemy(14, 3, 'orc'),
            this.createEnemy(3, 14, 'skeleton'),
        ];
        
        // Spawn items
        this.items = [
            { x: 5, y: 5, type: 'gold', amount: 50, icon: '💰' },
            { x: 10, y: 10, type: 'potion', amount: 20, icon: '🧪' },
            { x: 13, y: 13, type: 'treasure', amount: 100, icon: '💎' },
        ];
        
        // Spawn NPCs
        this.npcs = [
            { x: 8, y: 2, name: 'Merchant', emoji: '🧙', type: 'merchant' },
            { x: 2, y: 8, name: 'Guard', emoji: '🛡️', type: 'guard' },
        ];
        
        this.addMessage('Welcome to the Dungeon!', 'action');
        this.addMessage('Use arrow keys or buttons to move.', 'info');
    }
    
    createEnemy(x, y, type) {
        const enemies = {
            goblin: { hp: 30, maxHp: 30, attack: 5, defense: 2, exp: 25, emoji: '👹' },
            orc: { hp: 50, maxHp: 50, attack: 8, defense: 3, exp: 40, emoji: '👿' },
            skeleton: { hp: 25, maxHp: 25, attack: 6, defense: 1, exp: 30, emoji: '💀' },
        };
        
        return { x, y, type, ...enemies[type] };
    }
    
    addMessage(text, type = 'normal') {
        this.messageLog.push({ text, type, timestamp: Date.now() });
    }
    
    movePlayer(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        // Check bounds and collisions
        if (!this.isWalkable(newX, newY)) {
            this.addMessage('Cannot move there!', 'error');
            return;
        }
        
        // Check for enemy collision
        const enemy = this.enemies.find(e => e.x === newX && e.y === newY);
        if (enemy) {
            this.attackEnemy(enemy);
            return;
        }
        
        // Check for item pickup
        const item = this.items.find(i => i.x === newX && i.y === newY);
        if (item) {
            this.pickupItem(item);
        }
        
        // Check for NPC interaction
        const npc = this.npcs.find(n => n.x === newX && n.y === newY);
        if (npc) {
            this.interactNPC(npc);
            return;
        }
        
        this.player.x = newX;
        this.player.y = newY;
        this.addMessage(`Moved to (${newX}, ${newY})`, 'action');
    }
    
    isWalkable(x, y) {
        if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return false;
        return this.grid[y][x] !== 'wall';
    }
    
    attackEnemy(enemy) {
        const damage = Math.max(5, Math.floor(Math.random() * 15));
        const actualDamage = Math.max(1, damage - enemy.defense);
        
        enemy.hp -= actualDamage;
        this.addMessage(`Hit enemy for ${actualDamage} damage!`, 'combat');
        
        if (enemy.hp <= 0) {
            this.defeatEnemy(enemy);
        } else {
            // Enemy counterattack
            this.enemyAttackPlayer(enemy);
        }
    }
    
    defeatEnemy(enemy) {
        this.enemies = this.enemies.filter(e => e !== enemy);
        this.player.exp += enemy.exp;
        this.player.gold += Math.floor(enemy.maxHp * 2);
        this.addMessage(`Victory! +${enemy.exp} EXP, +${Math.floor(enemy.maxHp * 2)} Gold`, 'success');
    }
    
    enemyAttackPlayer(enemy) {
        const damage = Math.max(1, Math.floor(Math.random() * enemy.attack));
        this.player.hp -= damage;
        this.addMessage(`Enemy deals ${damage} damage!`, 'error');
        
        if (this.player.hp <= 0) {
            this.gameRunning = false;
            this.addMessage('You have been defeated!', 'error');
        }
    }
    
    pickupItem(item) {
        this.items = this.items.filter(i => i !== item);
        
        if (item.type === 'gold') {
            this.player.gold += item.amount;
            this.addMessage(`+${item.amount} Gold!`, 'success');
        } else if (item.type === 'potion') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + item.amount);
            this.addMessage(`+${item.amount} HP!`, 'success');
        } else if (item.type === 'treasure') {
            this.player.gold += item.amount;
            this.addMessage(`Treasure found! +${item.amount} Gold!`, 'success');
        }
    }
    
    interactNPC(npc) {
        this.addMessage(`You talk to ${npc.name}...`, 'action');
    }
    
    placeTrap(x, y, trapType) {
        if (this.player.gold < 50) {
            this.addMessage('Not enough gold!', 'error');
            return;
        }
        
        this.player.gold -= 50;
        this.traps.push({ x, y, type: trapType, active: true, damage: 20 });
        this.addMessage('Trap placed!', 'action');
    }
    
    useItem(itemId) {
        const item = this.player.inventory.find(i => i.id === itemId);
        if (!item || item.count <= 0) {
            this.addMessage('Item not available!', 'error');
            return;
        }
        
        if (item.id === 'potion') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
            item.count--;
            this.addMessage('Potion used! +30 HP', 'success');
        }
    }
    
    endTurn() {
        this.turn++;
        
        // Enemy AI
        this.enemies.forEach(enemy => {
            this.moveEnemyAI(enemy);
        });
        
        this.addMessage(`Turn ${this.turn}`, 'action');
    }
    
    moveEnemyAI(enemy) {
        // Simple AI: move towards player
        const dx = Math.sign(this.player.x - enemy.x);
        const dy = Math.sign(this.player.y - enemy.y);
        
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        
        if (this.isWalkable(newX, newY) && !(newX === this.player.x && newY === this.player.y)) {
            enemy.x = newX;
            enemy.y = newY;
        } else if (newX === this.player.x && newY === this.player.y) {
            this.enemyAttackPlayer(enemy);
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f1f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.drawTile(x, y);
            }
        }
        
        // Draw items
        this.items.forEach(item => {
            this.drawEntity(item.x, item.y, item.icon);
        });
        
        // Draw traps
        this.traps.forEach(trap => {
            this.drawEntity(trap.x, trap.y, '⚡');
        });
        
        // Draw NPCs
        this.npcs.forEach(npc => {
            this.drawEntity(npc.x, npc.y, npc.emoji);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.drawEntity(enemy.x, enemy.y, enemy.emoji);
        });
        
        // Draw player
        this.drawEntity(this.player.x, this.player.y, '👤');
    }
    
    drawTile(x, y) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        if (this.grid[y][x] === 'wall') {
            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
            this.ctx.strokeStyle = '#1a1a2e';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        } else {
            this.ctx.fillStyle = '#16213e';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
            this.ctx.strokeStyle = '#2a3a52';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
        }
    }
    
    drawEntity(x, y, emoji) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(emoji, px + this.tileSize / 2, py + this.tileSize / 2);
    }
    
    getSaveData() {
        return {
            turn: this.turn,
            player: { ...this.player },
            enemies: this.enemies,
            items: this.items,
            npcs: this.npcs,
            messageLog: this.messageLog,
        };
    }
    
    loadSaveData(data) {
        this.turn = data.turn;
        this.player = { ...data.player };
        this.enemies = data.enemies;
        this.items = data.items;
        this.npcs = data.npcs;
        this.messageLog = data.messageLog;
    }
}

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
