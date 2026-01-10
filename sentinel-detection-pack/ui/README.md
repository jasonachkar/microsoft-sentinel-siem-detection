# Sentinel Detection Pack - Interactive Security Platform

A stunning, interactive security operations platform showcasing Microsoft Sentinel detection capabilities with **real threat intelligence data** and advanced attack simulation.

![Dashboard](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal) ![Live Data](https://img.shields.io/badge/Data-Live%20Threat%20Intel-red)

## 🌟 Key Features

### 🗺️ Real Threat Intelligence
- **Live C2 Server Tracking** - Real-time data from [FeodoTracker](https://feodotracker.abuse.ch/)
- **Malicious URL Feeds** - Active threats from [URLhaus](https://urlhaus.abuse.ch/)
- **Global Attack Map** - Interactive visualization with country-level attack data
- **IP Reputation Lookup** - OSINT integration for threat enrichment

### ⚡ Enhanced Attack Simulator
- **12 Realistic Attack Scenarios** - Password Spray, MFA Fatigue, LSASS Dump, and more
- **Live Script Visualization** - Watch attack scripts execute in real-time
- **Detailed Command Output** - Terminal-style display showing exact commands
- **IOC Extraction** - Automatic indicator extraction with copy functionality
- **Remediation Steps** - Actionable response guidance for each attack

### 📋 SOC Kanban Incidents Board
- **Drag-and-Drop Workflow** - Move incidents between New → Triage → Investigating → Contained → Resolved
- **SLA Timers** - Visual countdown with breach warnings
- **Analyst Assignment** - Assign incidents to team members
- **Quick Filters** - Filter by severity, status, or assignee
- **Incident Details Modal** - Full investigation context in one view

### 🎯 MITRE ATT&CK Navigator
- **Interactive Technique Matrix** - Click any technique for details
- **Detection Coverage Analysis** - See which techniques are covered by rules
- **Threat Actor Tracking** - 6 major APT groups with technique mappings
- **Gap Analysis** - Identify detection gaps in your coverage
- **Campaign Visualization** - Highlight threat actor TTPs on the matrix

### 🔍 Investigation Workbench
- **Entity Relationship Graph** - ReactFlow-powered interactive graph
- **OSINT Lookup Panel** - IP, domain, and hash reputation checks
- **Evidence Collection** - Add notes, tags, and IOCs
- **Timeline View** - Chronological investigation events
- **Export Capabilities** - Generate investigation reports

### 📊 Detection Rules Catalog
- **Effectiveness Metrics** - True/false positive rates, tuning scores
- **Alert Volume Trends** - 7-day and 30-day alert statistics
- **Tuning Recommendations** - Guidance for rule optimization
- **KQL Query Viewer** - Syntax-highlighted query display
- **Version History** - Track rule changes over time

### 🎓 Additional Features
- **KQL Playground** - Execute simulated queries against sample data
- **Metrics Dashboard** - MTTD, MTTR, and coverage visualizations
- **Interactive Tutorial** - Guided walkthrough for new users
- **Dark/Light Theme** - Beautiful UI in both modes
- **Mobile Responsive** - Works on all screen sizes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── AttackSimulator.jsx    # Enhanced with script visualization
│   │   ├── Dashboard.jsx          # Main security dashboard
│   │   ├── Incidents.jsx          # Kanban-style incident board
│   │   ├── Investigation.jsx      # OSINT & entity graph
│   │   ├── Layout.jsx             # App shell with navigation
│   │   ├── MitreNavigator.jsx     # ATT&CK matrix with actors
│   │   ├── RulesCatalog.jsx       # Rules with effectiveness metrics
│   │   ├── ThreatMap.jsx          # Global threat visualization
│   │   ├── KQLPlayground.jsx      # Query execution environment
│   │   ├── Metrics.jsx            # SOC performance metrics
│   │   └── Tutorial.jsx           # Interactive guide
│   ├── services/
│   │   ├── attackSimulator.js     # Attack scenarios with scripts
│   │   ├── threatIntelService.js  # Real API integrations
│   │   └── utils.js               # Utility functions
│   ├── store/
│   │   └── appStore.js            # Zustand state management
│   └── data/
│       └── rules.json             # Detection rules (auto-synced)
```

## 🔴 Real Data vs Simulated Data

| Feature | Data Source | Type |
|---------|-------------|------|
| C2 Servers | FeodoTracker API | ✅ Real |
| Malicious URLs | URLhaus API | ✅ Real |
| Attack Trends | abuse.ch statistics | ✅ Real |
| MITRE ATT&CK | Official MITRE JSON | ✅ Real |
| Threat Actors | MITRE CTI Data | ✅ Real |
| IP Reputation | Aggregated feeds | ✅ Real |
| Security Alerts | Attack Simulator | 🔄 Simulated |
| Incidents | Demo data + Simulator | 🔄 Simulated |
| Sign-in Logs | Attack Simulator | 🔄 Simulated |

> **Note**: Actual Azure Sentinel alerts and incidents require an Azure subscription with Microsoft Sentinel deployed. The simulator creates realistic events for demonstration.

## 🎮 Attack Scenarios

| Scenario | Severity | MITRE Technique |
|----------|----------|-----------------|
| Password Spray | High | T1110.003 |
| MFA Fatigue | High | T1621 |
| LSASS Memory Dump | Critical | T1003.001 |
| Encoded PowerShell | High | T1059.001 |
| Service Principal Abuse | Critical | T1136.003 |
| Key Vault Exfiltration | Critical | T1552.004 |
| Lateral Movement | High | T1021.001/002 |
| Data Exfiltration | Critical | T1041 |
| Impossible Travel | Medium | T1078.004 |
| Phishing Campaign | High | T1566.001 |
| Email Forwarding | High | T1114.003 |
| Privilege Escalation | Critical | T1098.003 |

Each scenario includes:
- Detailed reconnaissance phase
- Actual attack scripts (PowerShell, Python, Bash)
- Command-by-command execution output
- Raw log samples as they'd appear in Sentinel
- Triggered alert details
- IOCs and remediation steps

## 🛠️ Technology Stack

- **React 18** - UI Framework
- **Vite 5** - Build tool
- **TailwindCSS 3** - Styling
- **Framer Motion** - Animations
- **ReactFlow** - Entity graphs
- **Recharts** - Data visualization
- **Zustand** - State management
- **React Router 6** - Navigation
- **Lucide React** - Icons

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
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

## 🔒 Security Considerations

- All threat intelligence data is fetched client-side from public APIs
- No credentials or sensitive data is stored
- Attack simulations run entirely in-browser
- OSINT lookups use sanitized queries

## 📈 Performance

- **Code Splitting** - Vendor chunks for optimal loading
- **Tree Shaking** - Minimal bundle size
- **Lazy Loading** - Components loaded on demand
- **Optimized Animations** - GPU-accelerated transforms

## 📝 License

MIT - See [LICENSE](../LICENSE) for details.

---

**Built for Security Professionals** | [Microsoft Sentinel](https://azure.microsoft.com/en-us/services/microsoft-sentinel/) | [MITRE ATT&CK](https://attack.mitre.org/)
