# Sentinel Detection Pack - Interactive Security Platform

A stunning, production-ready security operations platform showcasing Microsoft Sentinel detection capabilities with **live threat intelligence**, advanced attack simulation, and full incident management.

![React 18](https://img.shields.io/badge/React-18-blue) ![Vite 5](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS 3](https://img.shields.io/badge/TailwindCSS-3-teal) ![Live Data](https://img.shields.io/badge/Data-Live%20Threat%20Intel-red)

## 🚀 Major Features

### ⚡ Enhanced Attack Simulator
- **12 Realistic Attack Scenarios** with live script execution visualization
- **Terminal-Style Output** - Watch PowerShell, Python, and Bash scripts execute in real-time
- **IOC Extraction** - Automatic extraction of IPs, hashes, MITRE techniques
- **Incident Generation** - Creates real incidents that appear in the Incidents board
- **Remediation Steps** - Actionable guidance for each attack

### 📋 SOC Kanban Incidents Board
- **Drag-and-Drop Workflow** - Move incidents: New → Triage → Investigating → Contained → Resolved
- **SLA Timers** - Visual countdown with breach warnings
- **Analyst Assignment** - Assign to team members
- **Incident Linking** - Click "View Incidents" from simulator to see the generated incident
- **Persistent Storage** - Incidents saved to localStorage

### 🌍 Real-Time Threat Intelligence
- **Live API Integration** - Fetches from FeodoTracker, URLhaus, Emerging Threats
- **CORS Proxy Fallback** - Works even when direct API access is blocked
- **Auto-Refresh** - Updates every 5 minutes
- **Status Indicators** - Shows "LIVE DATA" when real APIs are working

### 🔔 Notification System
- **Real-Time Alerts** - New incidents trigger notifications
- **Browser Notifications** - Desktop notifications for critical events
- **Notification Panel** - Click to view and dismiss notifications
- **Clickable Links** - Navigate directly to incident from notification

### 📱 Fully Responsive Design
- **Mobile-First** - Works perfectly on phones, tablets, and desktops
- **Collapsible Sidebar** - Save space on smaller screens
- **Adaptive Cards** - All components adjust to screen size
- **Touch-Friendly** - Drag-and-drop works on touch devices

### ⌨️ Keyboard Shortcuts
- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + 1-9` - Quick navigation to pages
- `Escape` - Close modals and panels

## 🌐 Live Data Sources

| Data Type | Source | Status |
|-----------|--------|--------|
| C2 Servers | [FeodoTracker (abuse.ch)](https://feodotracker.abuse.ch/) | ✅ Real |
| Malicious URLs | [URLhaus (abuse.ch)](https://urlhaus.abuse.ch/) | ✅ Real |
| Compromised IPs | [Emerging Threats](https://rules.emergingthreats.net/) | ✅ Real |
| MITRE ATT&CK | Official MITRE Data | ✅ Real |
| Threat Actors | MITRE CTI | ✅ Real |
| Security Alerts | Attack Simulator | 🔄 Simulated |
| Incidents | Generated + Simulator | 🔄 Simulated |

> **Note**: If you see "Demo Mode" instead of "LIVE DATA", your browser may be blocking cross-origin requests. This is normal and the demo data is still representative.

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 How It Works

### Incident Flow
1. **Run Attack Simulation** → Generates security events + creates incident
2. **Click "View Incidents"** → Navigates to Incidents page with incident highlighted
3. **Drag to Different Column** → Updates incident status (saves to localStorage)
4. **Click Incident** → View full details, IOCs, remediation steps

### Threat Intelligence Flow
1. **App loads** → Fetches from real APIs (FeodoTracker, URLhaus)
2. **CORS fails?** → Automatically uses CORS proxy
3. **Proxy fails?** → Falls back to realistic demo data
4. **Status shown** → "LIVE DATA" badge or "Demo Mode" indicator

### Notification Flow
1. **Attack completes** → Creates incident
2. **Incident created** → Notification appears
3. **Click notification** → Navigate to incident
4. **High severity** → Browser notification (if permitted)

## 📁 Project Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── AttackSimulator.jsx   # Enhanced with script visualization
│   │   ├── Dashboard.jsx         # Live data status indicators
│   │   ├── Incidents.jsx         # Kanban board with drag-and-drop
│   │   ├── Investigation.jsx     # OSINT lookups, entity graph
│   │   ├── Layout.jsx            # Notifications, responsive sidebar
│   │   ├── MitreNavigator.jsx    # Threat actor tracking
│   │   ├── RulesCatalog.jsx      # Effectiveness metrics
│   │   ├── ThreatMap.jsx         # Real-time threat data
│   │   └── ...
│   ├── services/
│   │   ├── attackSimulator.js    # 12 scenarios with scripts
│   │   ├── threatIntelService.js # Real API integration
│   │   └── utils.js              # Utility functions
│   └── store/
│       └── appStore.js           # Zustand with persistence
```

## 🎮 Attack Scenarios

| Scenario | MITRE Technique | What You'll See |
|----------|-----------------|-----------------|
| Password Spray | T1110.003 | PowerShell spray script execution |
| MFA Fatigue | T1621 | Python push bomber script |
| LSASS Dump | T1003.001 | Mimikatz commands and output |
| Encoded PowerShell | T1059.001 | Base64 decode and execution |
| Lateral Movement | T1021.001 | WMI/PsExec remote commands |
| Data Exfiltration | T1041 | File staging and upload |
| And 6 more... | | |

## 🛠️ Technology Stack

- **React 18** + **Vite 5** - Fast development and builds
- **TailwindCSS 3** - Utility-first styling
- **Framer Motion** - Smooth animations
- **ReactFlow** - Entity relationship graphs
- **Recharts** - Data visualizations
- **Zustand** - Simple state management with persistence
- **React Router 6** - Client-side routing

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🔒 Security Notes

- All threat intel fetched from public APIs
- No credentials or sensitive data stored
- Attack simulations run entirely client-side
- OSINT lookups use sanitized queries
- Demo incidents stored in localStorage only

---

**Built for Security Professionals** | Showcases Microsoft Sentinel detection capabilities
