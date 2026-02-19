// Utility functions for the application

export function createPageUrl(pageName) {
  const pageMap = {
    Dashboard: '/dashboard',
    GameModes: '/game-modes',
    GameSession: '/game-session',
    LevelCreator: '/level-creator',
    Profile: '/profile',
    AdminDashboard: '/admin',
    CommunityLevels: '/community-levels',
    Settings: '/settings',
  };
  
  return pageMap[pageName] || `/${pageName.toLowerCase()}`;
}

export function navigateTo(pageName, router) {
  const url = createPageUrl(pageName);
  if (router) {
    router.push(url);
  } else {
    window.location.href = url;
  }
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
