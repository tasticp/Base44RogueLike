// Entity API client implementations
// These wrap the backend API endpoints with helper methods

const API_BASE = '/api/entities';

class EntityClient {
  constructor(entityType) {
    this.entityType = entityType;
  }

  async list(filter = {}) {
    const query = new URLSearchParams(filter).toString();
    const response = await fetch(`${API_BASE}/${this.entityType}${query ? '?' + query : ''}`);
    if (!response.ok) throw new Error(`Failed to list ${this.entityType}`);
    return response.json();
  }

  async get(id) {
    const response = await fetch(`${API_BASE}/${this.entityType}/${id}`);
    if (!response.ok) throw new Error(`Failed to get ${this.entityType} ${id}`);
    return response.json();
  }

  async create(data) {
    const response = await fetch(`${API_BASE}/${this.entityType}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create ${this.entityType}`);
    return response.json();
  }

  async update(id, data) {
    const response = await fetch(`${API_BASE}/${this.entityType}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to update ${this.entityType}`);
    return response.json();
  }

  async delete(id) {
    const response = await fetch(`${API_BASE}/${this.entityType}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to delete ${this.entityType}`);
    return response.json();
  }

  async filter(criteria) {
    return this.list(criteria);
  }

  async me() {
    const response = await fetch('/api/user/me');
    if (!response.ok) throw new Error('Failed to get current user');
    return response.json();
  }
}

// Export entity clients
export const GameSession = new EntityClient('GameSession');
export const GameObject = new EntityClient('GameObject');
export const GameLevel = new EntityClient('GameLevel');
export const PlayerProfile = new EntityClient('PlayerProfile');
export const AdminAction = new EntityClient('AdminAction');
export const User = new EntityClient('User');
