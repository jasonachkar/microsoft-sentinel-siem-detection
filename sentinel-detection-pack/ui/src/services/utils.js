// Utility functions

// UUID generator (simple version)
export function v4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Format relative time
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

// Format bytes to human readable
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format number with commas
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get severity color
export function getSeverityColor(severity) {
  const colors = {
    Critical: 'text-red-500 bg-red-500/10',
    High: 'text-orange-500 bg-orange-500/10',
    Medium: 'text-yellow-500 bg-yellow-500/10',
    Low: 'text-green-500 bg-green-500/10',
    Info: 'text-blue-500 bg-blue-500/10',
  };
  return colors[severity] || colors.Info;
}

// Get severity badge classes
export function getSeverityBadge(severity) {
  const badges = {
    Critical: 'bg-red-600 text-white',
    High: 'bg-orange-500 text-white',
    Medium: 'bg-yellow-500 text-black',
    Low: 'bg-green-500 text-white',
    Info: 'bg-blue-500 text-white',
  };
  return badges[severity] || badges.Info;
}

// Get status color
export function getStatusColor(status) {
  const colors = {
    New: 'text-cyan-400 bg-cyan-500/10',
    Triage: 'text-yellow-400 bg-yellow-500/10',
    Investigating: 'text-orange-400 bg-orange-500/10',
    Contained: 'text-green-400 bg-green-500/10',
    Resolved: 'text-gray-400 bg-gray-500/10',
    Active: 'text-red-400 bg-red-500/10',
    Closed: 'text-gray-500 bg-gray-500/10',
  };
  return colors[status] || colors.New;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Generate hash from string
export function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Random item from array
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random integer in range
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp number
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Lerp (linear interpolation)
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Class names utility (like clsx)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Sleep utility
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse KQL-like syntax for simple queries
export function parseSimpleQuery(query) {
  const tokens = [];
  const regex = /(\w+)\s*(==|!=|contains|has|startswith|endswith)\s*["']?([^"'\s]+)["']?/gi;
  let match;
  
  while ((match = regex.exec(query)) !== null) {
    tokens.push({
      field: match[1],
      operator: match[2].toLowerCase(),
      value: match[3]
    });
  }
  
  return tokens;
}

// Apply simple filter to data
export function applyFilter(data, filters) {
  return data.filter(item => {
    return filters.every(filter => {
      const value = item[filter.field];
      if (value === undefined) return false;
      
      const strValue = String(value).toLowerCase();
      const filterValue = filter.value.toLowerCase();
      
      switch (filter.operator) {
        case '==':
          return strValue === filterValue;
        case '!=':
          return strValue !== filterValue;
        case 'contains':
        case 'has':
          return strValue.includes(filterValue);
        case 'startswith':
          return strValue.startsWith(filterValue);
        case 'endswith':
          return strValue.endsWith(filterValue);
        default:
          return true;
      }
    });
  });
}

// Calculate MITRE coverage percentage
export function calculateMitreCoverage(rules, allTechniques) {
  const coveredTechniques = new Set();
  rules.forEach(rule => {
    (rule.techniques || []).forEach(tech => coveredTechniques.add(tech));
  });
  return Math.round((coveredTechniques.size / allTechniques.length) * 100);
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
}

// Sort by multiple keys
export function sortBy(array, ...keys) {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = typeof key === 'function' ? key(a) : a[key];
      const bVal = typeof key === 'function' ? key(b) : b[key];
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

export default {
  v4,
  formatRelativeTime,
  formatBytes,
  formatNumber,
  getSeverityColor,
  getSeverityBadge,
  getStatusColor,
  debounce,
  throttle,
  hashString,
  randomItem,
  randomInt,
  clamp,
  lerp,
  cn,
  sleep,
  parseSimpleQuery,
  applyFilter,
  calculateMitreCoverage,
  groupBy,
  sortBy
};
