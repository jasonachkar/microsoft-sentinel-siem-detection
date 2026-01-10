# Sentinel Detection Pack UI

Interactive Cloud Security Operations Platform built with React, Vite, and TailwindCSS.

## Features

- **Dashboard** - Real-time security operations overview
- **Threat Map** - Global attack visualization with live threat intelligence
- **Attack Simulator** - 12 realistic attack scenarios with live event streams
- **Incidents** - Incident management and triage workflow
- **Investigation** - Entity graph and timeline-based investigation
- **Detection Rules** - Catalog of 15 production-ready KQL rules
- **MITRE ATT&CK** - Interactive coverage matrix navigator
- **KQL Playground** - Query editor with sample data
- **Metrics** - SOC analytics and performance dashboards
- **Tutorial** - Interactive learning paths for different personas

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `npm run sync-data` | Regenerate rules.json from source |

## Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS
- **React Router 6** - Client-side routing
- **Zustand** - State management
- **Framer Motion** - Animations
- **Recharts** - Data visualizations
- **React Flow** - Entity relationship graphs
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/          # React components
│   ├── Layout.jsx       # App layout with sidebar
│   ├── Dashboard.jsx    # Main dashboard
│   ├── ThreatMap.jsx    # Threat visualization
│   ├── AttackSimulator.jsx  # Attack simulation
│   ├── Incidents.jsx    # Incident management
│   ├── Investigation.jsx    # Investigation workbench
│   ├── RulesCatalog.jsx # Detection rules
│   ├── MitreNavigator.jsx   # MITRE ATT&CK matrix
│   ├── KQLPlayground.jsx    # Query playground
│   ├── Metrics.jsx      # Analytics dashboard
│   └── Tutorial.jsx     # Interactive tutorials
├── services/            # Business logic
│   ├── attackSimulator.js   # Attack simulation engine
│   ├── threatIntelService.js    # Threat intelligence
│   └── utils.js         # Utility functions
├── store/               # State management
│   └── appStore.js      # Zustand store
├── data/                # Static data
│   └── rules.json       # Detection rules catalog
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── styles.css           # Global styles
```

## Deployment

### Vercel

1. Connect your repository to Vercel
2. Set root directory to `ui/`
3. Build command: `npm run build`
4. Output directory: `dist`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Azure Functions API URL | No (demo mode if unset) |

## Theme

The UI supports dark and light themes. Toggle with the sun/moon icon in the header.

## Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      cyber: { /* teal accent colors */ },
      threat: { /* severity colors */ },
      dark: { /* dark mode grays */ },
    }
  }
}
```

### Adding Attack Scenarios

Edit `src/services/attackSimulator.js` to add new scenarios:

```js
export const ATTACK_SCENARIOS = {
  myNewScenario: {
    id: 'my-scenario',
    name: 'My Attack Scenario',
    severity: 'High',
    tactics: ['Initial Access'],
    techniques: ['T1078'],
    phases: [/* ... */]
  }
};
```

## Performance

- **Code Splitting** - Automatic vendor chunk splitting
- **Lazy Loading** - Components loaded on demand
- **Optimized Bundle** - ~300KB gzipped total

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License - see [LICENSE](../LICENSE)
