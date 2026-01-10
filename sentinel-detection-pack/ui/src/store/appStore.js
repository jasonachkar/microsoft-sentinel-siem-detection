import { create } from 'zustand';

// Simple persist implementation
const getStoredTheme = () => {
  try {
    return localStorage.getItem('sentinel-app-theme') || 'dark';
  } catch {
    return 'dark';
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem('sentinel-app-theme', theme);
  } catch {}
};

// Load persisted incidents
const getStoredIncidents = () => {
  try {
    const stored = localStorage.getItem('sentinel-incidents');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveIncidents = (incidents) => {
  try {
    localStorage.setItem('sentinel-incidents', JSON.stringify(incidents.slice(0, 100)));
  } catch {}
};

// Generate unique IDs
const generateId = () => `inc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create((set, get) => ({
  // Theme
  theme: getStoredTheme(),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    saveTheme(newTheme);
    return { theme: newTheme };
  }),
  
  // Attack simulation state
  isAttackMode: false,
  attackScenario: null,
  attackProgress: 0,
  attackEvents: [],
  currentAttackId: null,
  
  setAttackMode: (isActive, scenario = null) => {
    const attackId = isActive ? generateId() : null;
    set({ 
      isAttackMode: isActive, 
      attackScenario: scenario,
      attackProgress: 0,
      attackEvents: [],
      currentAttackId: attackId
    });
    return attackId;
  },
  
  addAttackEvent: (event) => set((state) => ({ 
    attackEvents: [...state.attackEvents, event].slice(-100)
  })),
  
  setAttackProgress: (progress) => set({ attackProgress: progress }),
  
  // Live events
  liveEvents: [],
  addLiveEvent: (event) => set((state) => {
    const newEvent = {
      ...event,
      id: event.id || generateId(),
      timestamp: event.timestamp || new Date().toISOString()
    };
    return { liveEvents: [newEvent, ...state.liveEvents].slice(0, 500) };
  }),
  clearLiveEvents: () => set({ liveEvents: [] }),
  
  // Incidents - now properly persisted and linked
  incidents: getStoredIncidents(),
  
  addIncident: (incident) => set((state) => {
    const newIncident = {
      ...incident,
      id: incident.id || generateId(),
      createdAt: incident.createdAt || new Date().toISOString(),
      status: incident.status || 'New',
      assignee: incident.assignee || null,
      comments: incident.comments || 0,
      attachments: incident.attachments || 0,
      slaMinutes: incident.slaMinutes || 60,
      entities: incident.entities || { users: 0, ips: 0, devices: 0 },
      alertCount: incident.alertCount || 1,
      isFromSimulator: true, // Mark simulator-generated incidents
    };
    const updatedIncidents = [newIncident, ...state.incidents];
    saveIncidents(updatedIncidents);
    
    // Also add notification
    get().addNotification({
      type: 'incident',
      title: 'New Incident Created',
      message: newIncident.title,
      severity: newIncident.severity,
      incidentId: newIncident.id
    });
    
    return { incidents: updatedIncidents };
  }),
  
  updateIncident: (id, updates) => set((state) => {
    const updatedIncidents = state.incidents.map(inc => 
      inc.id === id ? { ...inc, ...updates } : inc
    );
    saveIncidents(updatedIncidents);
    return { incidents: updatedIncidents };
  }),
  
  removeIncident: (id) => set((state) => {
    const updatedIncidents = state.incidents.filter(inc => inc.id !== id);
    saveIncidents(updatedIncidents);
    return { incidents: updatedIncidents };
  }),
  
  clearSimulatorIncidents: () => set((state) => {
    const updatedIncidents = state.incidents.filter(inc => !inc.isFromSimulator);
    saveIncidents(updatedIncidents);
    return { incidents: updatedIncidents };
  }),
  
  // Selected entities for investigation
  selectedIncident: null,
  setSelectedIncident: (incident) => set({ selectedIncident: incident }),
  selectedEntities: [],
  setSelectedEntities: (entities) => set({ selectedEntities: entities }),
  addSelectedEntity: (entity) => set((state) => ({
    selectedEntities: [...state.selectedEntities.filter(e => e.id !== entity.id), entity]
  })),
  clearSelectedEntities: () => set({ selectedEntities: [] }),
  
  // Tutorial mode
  tutorialMode: null,
  tutorialStep: 0,
  setTutorialMode: (mode) => set({ tutorialMode: mode, tutorialStep: 0 }),
  nextTutorialStep: () => set((state) => ({ tutorialStep: state.tutorialStep + 1 })),
  
  // Threat intelligence data
  threatIntel: {
    maliciousIPs: [],
    c2Servers: [],
    malwareHashes: [],
    phishingDomains: [],
    geoAttacks: [],
    recentAttacks: [],
    lastUpdated: null,
    isLoading: false,
    isRealData: false,
    error: null
  },
  
  setThreatIntel: (data) => set((state) => ({ 
    threatIntel: { 
      ...state.threatIntel, 
      ...data, 
      lastUpdated: new Date().toISOString(),
      isLoading: false 
    }
  })),
  
  setThreatIntelLoading: (isLoading) => set((state) => ({
    threatIntel: { ...state.threatIntel, isLoading }
  })),
  
  setThreatIntelError: (error) => set((state) => ({
    threatIntel: { ...state.threatIntel, error, isLoading: false }
  })),
  
  // Metrics
  metrics: {
    alertsLast24h: 0,
    incidentsOpen: 0,
    mttd: 0,
    mttr: 0,
    falsePositiveRate: 0,
    coverageScore: 0
  },
  setMetrics: (metrics) => set((state) => ({ 
    metrics: { ...state.metrics, ...metrics }
  })),
  
  // Connection status
  connectionStatus: 'connecting',
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  // Notifications with persistence
  notifications: [],
  addNotification: (notification) => {
    const newNotification = { 
      id: generateId(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50)
    }));
    
    // Play sound for high severity
    if (notification.severity === 'Critical' || notification.severity === 'High') {
      try {
        // Browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(`🚨 ${notification.title}`, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      } catch {}
    }
    
    return newNotification.id;
  },
  
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Global search
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  
  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
