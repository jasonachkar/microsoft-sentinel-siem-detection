import { create } from 'zustand';

// Simple persist implementation without middleware (for compatibility)
const getStoredTheme = () => {
  try {
    const stored = localStorage.getItem('sentinel-app-theme');
    return stored || 'dark';
  } catch {
    return 'dark';
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem('sentinel-app-theme', theme);
  } catch {
    // Ignore storage errors
  }
};

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
      setAttackMode: (isActive, scenario = null) => set({ 
        isAttackMode: isActive, 
        attackScenario: scenario,
        attackProgress: 0,
        attackEvents: []
      }),
      addAttackEvent: (event) => set((state) => ({ 
        attackEvents: [...state.attackEvents, event].slice(-100)
      })),
      setAttackProgress: (progress) => set({ attackProgress: progress }),
      
      // Live events
      liveEvents: [],
      addLiveEvent: (event) => set((state) => ({
        liveEvents: [event, ...state.liveEvents].slice(0, 200)
      })),
      clearLiveEvents: () => set({ liveEvents: [] }),
      
      // Incidents
      incidents: [],
      setIncidents: (incidents) => set({ incidents }),
      addIncident: (incident) => set((state) => ({
        incidents: [incident, ...state.incidents]
      })),
      updateIncident: (id, updates) => set((state) => ({
        incidents: state.incidents.map(inc => 
          inc.id === id ? { ...inc, ...updates } : inc
        )
      })),
      
      // Selected entities for investigation
      selectedIncident: null,
      setSelectedIncident: (incident) => set({ selectedIncident: incident }),
      
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
        lastUpdated: null
      },
      setThreatIntel: (data) => set((state) => ({ 
        threatIntel: { ...state.threatIntel, ...data, lastUpdated: new Date().toISOString() }
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
      connectionStatus: 'disconnected',
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      
      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { 
          id: Date.now(), 
          ...notification,
          timestamp: new Date().toISOString()
        }].slice(-50)
      })),
      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
}));
