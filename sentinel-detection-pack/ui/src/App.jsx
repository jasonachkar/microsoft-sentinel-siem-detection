import { useEffect, useMemo, useState } from 'react';
import rulesData from './data/rules.json';

const severityRank = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1
};

const emptyArray = [];

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function normalize(value) {
  return String(value || '').toLowerCase();
}

function formatList(list) {
  if (!list || list.length === 0) return 'None';
  return list.join(', ');
}

function hashString(input) {
  let hash = 0;
  const value = String(input || '');
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatClock(minutesAgo) {
  const date = new Date(Date.now() - minutesAgo * 60000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value) {
  if (!value) return 'manual';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function SeverityPill({ value }) {
  const label = value || 'Unknown';
  return <span className={`pill severity ${label.toLowerCase()}`}>{label}</span>;
}

function StatusPill({ value }) {
  const label = value || 'Unknown';
  return <span className={`pill status ${label.toLowerCase().replace(/\\s+/g, '-')}`}>{label}</span>;
}

export default function App() {
  const rules = rulesData.rules || [];
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [tactic, setTactic] = useState('All');
  const [selectedRule, setSelectedRule] = useState(null);
  const buildLabel = formatDateTime(rulesData.generatedAt);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const apiEnabled = apiBaseUrl.trim().length > 0;
  const [liveData, setLiveData] = useState({
    incidents: null,
    alerts: null,
    freshness: null,
    status: 'idle',
    error: null
  });
  const liveStatusLabel = !apiEnabled
    ? 'Simulated'
    : liveData.status === 'ready'
    ? 'Connected'
    : liveData.status === 'error'
    ? 'Unavailable'
    : 'Connecting';

  const categories = useMemo(
    () => uniqueSorted(rules.map((rule) => rule.category || 'unknown')),
    [rules]
  );
  const tactics = useMemo(
    () => uniqueSorted(rules.flatMap((rule) => rule.tactics || emptyArray)),
    [rules]
  );

  const stats = useMemo(() => {
    const connectors = uniqueSorted(rules.flatMap((rule) => rule.connectors || emptyArray));
    const dataTypes = uniqueSorted(rules.flatMap((rule) => rule.dataTypes || emptyArray));
    const techniques = uniqueSorted(rules.flatMap((rule) => rule.techniques || emptyArray));
    const sevCounts = rules.reduce(
      (acc, rule) => {
        acc[rule.severity] = (acc[rule.severity] || 0) + 1;
        return acc;
      },
      { Critical: 0, High: 0, Medium: 0, Low: 0 }
    );
    return {
      connectors,
      dataTypes,
      techniques,
      sevCounts
    };
  }, [rules]);

  const filteredRules = useMemo(() => {
    const q = normalize(query);
    return rules
      .filter((rule) => {
        const matchesQuery =
          !q ||
          normalize(rule.name).includes(q) ||
          normalize(rule.description).includes(q) ||
          normalize(formatList(rule.techniques)).includes(q) ||
          normalize(formatList(rule.tactics)).includes(q) ||
          normalize(formatList(rule.connectors)).includes(q) ||
          normalize(formatList(rule.dataTypes)).includes(q);
        const matchesCategory = category === 'All' || (rule.category || 'unknown') === category;
        const matchesSeverity = severity === 'All' || rule.severity === severity;
        const matchesTactic = tactic === 'All' || (rule.tactics || []).includes(tactic);
        return matchesQuery && matchesCategory && matchesSeverity && matchesTactic;
      })
      .sort((a, b) => {
        const rankA = severityRank[a.severity] || 0;
        const rankB = severityRank[b.severity] || 0;
        return rankB - rankA || a.name.localeCompare(b.name);
      });
  }, [rules, query, category, severity, tactic]);

  const coverage = useMemo(() => {
    return tactics.map((tac) => {
      const count = rules.filter((rule) => (rule.tactics || []).includes(tac)).length;
      return { tactic: tac, count };
    });
  }, [tactics, rules]);

  const highValueRules = useMemo(() => {
    return rules
      .filter((rule) => ['High', 'Critical'].includes(rule.severity))
      .slice(0, 6);
  }, [rules]);

  const incidentQueue = useMemo(() => {
    const analysts = ['Analyst-01', 'Analyst-02', 'Analyst-03', 'Analyst-04'];
    const statuses = ['New', 'Triage', 'Investigating', 'Contained'];
    const types = ['Credential Abuse', 'Persistence', 'Data Exfiltration', 'Suspicious Login'];
    return rules
      .filter((rule) => ['High', 'Critical', 'Medium'].includes(rule.severity))
      .slice(0, 9)
      .map((rule, index) => {
        const seed = hashString(rule.id + index);
        const ageMinutes = 12 + (seed % 420);
        return {
          id: rule.id,
          title: rule.name,
          severity: rule.severity,
          status: statuses[seed % statuses.length],
          owner: analysts[seed % analysts.length],
          type: types[seed % types.length],
          age: formatAge(ageMinutes),
          time: formatClock(ageMinutes),
          entities: 1 + (seed % 6)
        };
      });
  }, [rules]);

  const liveIncidentQueue = useMemo(() => {
    if (!liveData.incidents?.items?.length) return null;
    return liveData.incidents.items.map((incident, index) => {
      const lastSeen = incident.lastSeen || incident.LastSeen;
      const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date();
      const ageMinutes = Math.max(0, Math.round((Date.now() - lastSeenDate.getTime()) / 60000));
      return {
        id: incident.title || incident.Title || `${index}`,
        title: incident.title || incident.Title || 'Incident',
        severity: incident.severity || incident.Severity || 'Medium',
        status: incident.status || incident.Status || 'New',
        owner: incident.owner || incident.Owner || 'Unassigned',
        type: 'Incident',
        age: formatAge(ageMinutes),
        time: formatClock(ageMinutes),
        entities: incident.entities || incident.Entities || 1
      };
    });
  }, [liveData.incidents]);

  const timelineEvents = useMemo(() => {
    const eventTypes = [
      'Signal observed',
      'Alert grouped into incident',
      'Automation executed',
      'Entity enrichment completed',
      'Analyst note added',
      'Containment recommendation queued'
    ];
    const sources = stats.connectors.length > 0 ? stats.connectors : ['AzureActiveDirectory', 'MicrosoftThreatProtection'];
    return rules.slice(0, 10).map((rule, index) => {
      const seed = hashString(rule.id + index);
      const minutesAgo = 4 + index * 9 + (seed % 7);
      return {
        id: `${rule.id}-${index}`,
        title: eventTypes[seed % eventTypes.length],
        source: sources[seed % sources.length],
        time: formatClock(minutesAgo),
        severity: rule.severity
      };
    });
  }, [rules, stats.connectors]);

  const liveTimelineEvents = useMemo(() => {
    if (!liveData.alerts?.items?.length) return null;
    return liveData.alerts.items.slice(0, 20).map((alert, index) => {
      const timeValue = alert.timeGenerated || alert.TimeGenerated;
      const time = timeValue ? new Date(timeValue) : new Date();
      const minutesAgo = Math.max(0, Math.round((Date.now() - time.getTime()) / 60000));
      return {
        id: `${alert.alertName || alert.AlertName || index}-${index}`,
        title: alert.alertName || alert.AlertName || 'Security Alert',
        source: alert.productName || alert.ProductName || 'SecurityAlert',
        time: formatClock(minutesAgo),
        severity: alert.alertSeverity || alert.AlertSeverity || 'Medium'
      };
    });
  }, [liveData.alerts]);

  const connectorHealth = useMemo(() => {
    const connectors = stats.connectors.length > 0 ? stats.connectors : ['AzureActiveDirectory', 'MicrosoftThreatProtection'];
    return connectors.slice(0, 8).map((connector) => {
      const seed = hashString(connector);
      const healthScore = seed % 10;
      const status = healthScore < 6 ? 'Healthy' : healthScore < 8 ? 'Degraded' : 'Attention';
      const lag = 2 + (seed % 48);
      return {
        name: connector,
        status,
        lag,
        lastSeen: formatAge(lag)
      };
    });
  }, [stats.connectors]);

  const liveConnectorHealth = useMemo(() => {
    if (!liveData.freshness?.items?.length) return null;
    return liveData.freshness.items.slice(0, 10).map((item) => {
      const lastSeen = item.lastSeen || item.LastSeen;
      const ageMinutes = item.ageMinutes || item.AgeMinutes || 0;
      const status = ageMinutes <= 15 ? 'Healthy' : ageMinutes <= 60 ? 'Degraded' : 'Attention';
      return {
        name: item.tableName || item.TableName || 'Unknown',
        status,
        lag: Math.round(ageMinutes),
        lastSeen: lastSeen ? formatDateTime(lastSeen) : 'Unknown'
      };
    });
  }, [liveData.freshness]);

  useEffect(() => {
    if (!apiEnabled) {
      return undefined;
    }
    let isMounted = true;
    const fetchJson = async (path) => {
      const response = await fetch(`${apiBaseUrl}${path}`);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      return response.json();
    };

    const load = async () => {
      setLiveData((prev) => ({ ...prev, status: 'loading', error: null }));
      try {
        const [incidents, alerts, freshness] = await Promise.all([
          fetchJson('/api/incidents'),
          fetchJson('/api/alerts'),
          fetchJson('/api/table-freshness')
        ]);
        if (!isMounted) return;
        setLiveData({
          incidents,
          alerts,
          freshness,
          status: 'ready',
          error: null
        });
      } catch (error) {
        if (!isMounted) return;
        setLiveData((prev) => ({ ...prev, status: 'error', error: error.message || 'API unavailable' }));
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl, apiEnabled]);

  const handleClear = () => {
    setQuery('');
    setCategory('All');
    setSeverity('All');
    setTactic('All');
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-left">
          <div className="badge">SIEM CONSOLE</div>
          <h1>Sentinel Detection Pack</h1>
          <p className="hero-subtitle">
            A production-grade analytics rule pack presented like a live SOC console. Explore rule coverage,
            critical detections, and telemetry expectations from a single surface.
          </p>
          <div className="hero-actions">
            <button className="btn primary" onClick={() => document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' })}>
              Open Rule Catalog
            </button>
            <button className="btn ghost" onClick={() => setSelectedRule(highValueRules[0] || null)}>
              Spotlight High Severity
            </button>
          </div>
          <div className="hero-meta">
            <div>
              <span className="meta-label">Catalog build</span>
              <span className="meta-value">{buildLabel}</span>
            </div>
            <div>
              <span className="meta-label">Total rules</span>
              <span className="meta-value">{rulesData.total || rules.length}</span>
            </div>
            <div>
              <span className="meta-label">Live data</span>
              <span className="meta-value">{liveStatusLabel}</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="console-card">
            <div className="console-header">Signal Health</div>
            <div className="console-grid">
              <div className="console-item">
                <span className="console-label">Critical</span>
                <span className="console-value">{stats.sevCounts.Critical}</span>
              </div>
              <div className="console-item">
                <span className="console-label">High</span>
                <span className="console-value">{stats.sevCounts.High}</span>
              </div>
              <div className="console-item">
                <span className="console-label">Medium</span>
                <span className="console-value">{stats.sevCounts.Medium}</span>
              </div>
              <div className="console-item">
                <span className="console-label">Low</span>
                <span className="console-value">{stats.sevCounts.Low}</span>
              </div>
            </div>
            <div className="console-footer">
              <div>
                <span className="meta-label">Connectors</span>
                <span className="meta-value">{stats.connectors.length}</span>
              </div>
              <div>
                <span className="meta-label">Data types</span>
                <span className="meta-value">{stats.dataTypes.length}</span>
              </div>
              <div>
                <span className="meta-label">Techniques</span>
                <span className="meta-value">{stats.techniques.length}</span>
              </div>
            </div>
          </div>
          <div className="coverage-card">
            <div className="console-header">MITRE Coverage</div>
            <div className="coverage-grid">
              {coverage.map((item) => (
                <div key={item.tactic} className="coverage-item">
                  <span>{item.tactic}</span>
                  <span className="coverage-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>Operations Console</h2>
            <p>Live-style views built from the detection catalog to mirror real SOC triage workflows.</p>
          </div>
        </div>
        <div className="ops-grid">
          <div className="ops-panel">
            <div className="panel-header">
              <div>
                <h3>Incident Queue</h3>
                <span className="panel-subtitle">Prioritized by severity and age</span>
              </div>
              <span className="panel-badge">{(liveIncidentQueue || incidentQueue).length} open</span>
            </div>
            <div className="incident-list">
              {(liveIncidentQueue || incidentQueue).map((incident) => (
                <div key={incident.id} className="incident-row">
                  <div className="incident-title">
                    <SeverityPill value={incident.severity} />
                    <span className="incident-name">{incident.title}</span>
                  </div>
                  <div className="incident-meta">
                    <StatusPill value={incident.status} />
                    <span>{incident.type}</span>
                    <span>{incident.owner}</span>
                    <span>{incident.age}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="panel-footer">
              {apiEnabled && liveData.status === 'ready'
                ? 'Live data sourced from Log Analytics.'
                : 'Signal data derived from rule metadata.'}
            </div>
          </div>
          <div className="ops-panel">
            <div className="panel-header">
              <div>
                <h3>Signal Timeline</h3>
                <span className="panel-subtitle">Recent activity across connectors</span>
              </div>
              <span className="panel-badge">Last 24 hours</span>
            </div>
            <div className="timeline">
              {(liveTimelineEvents || timelineEvents).map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-time">{event.time}</div>
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <span className="timeline-title">{event.title}</span>
                    <span className="timeline-meta">{event.source}</span>
                  </div>
                  <SeverityPill value={event.severity} />
                </div>
              ))}
            </div>
          </div>
          <div className="ops-panel">
            <div className="panel-header">
              <div>
                <h3>Connector Health</h3>
                <span className="panel-subtitle">Ingestion status and lag</span>
              </div>
              <span className="panel-badge">{(liveConnectorHealth || connectorHealth).length} connectors</span>
            </div>
            <div className="connector-list">
              {(liveConnectorHealth || connectorHealth).map((connector) => (
                <div key={connector.name} className="connector-item">
                  <div>
                    <div className="connector-name">{connector.name}</div>
                    <div className="connector-meta">
                      <StatusPill value={connector.status} />
                      <span>{connector.lag}m lag</span>
                      <span>Last seen {connector.lastSeen}</span>
                    </div>
                  </div>
                  <button className="btn ghost">Details</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="catalog">
        <div className="section-header">
          <div>
            <h2>Rule Catalog</h2>
            <p>Filter by category, severity, or MITRE tactic. Click a rule to inspect its full definition.</p>
          </div>
          <div className="filters">
            <input
              className="search"
              placeholder="Search by rule, tactic, technique, connector"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="All">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
              <option value="All">All severities</option>
              {Object.keys(severityRank).map((sev) => (
                <option key={sev} value={sev}>
                  {sev}
                </option>
              ))}
            </select>
            <select value={tactic} onChange={(event) => setTactic(event.target.value)}>
              <option value="All">All tactics</option>
              {tactics.map((tac) => (
                <option key={tac} value={tac}>
                  {tac}
                </option>
              ))}
            </select>
            <button className="btn ghost" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        <div className="catalog-grid">
          {filteredRules.map((rule, index) => (
            <button
              key={rule.id}
              className="rule-card"
              style={{ animationDelay: `${index * 40}ms` }}
              onClick={() => setSelectedRule(rule)}
            >
              <div className="rule-top">
                <SeverityPill value={rule.severity} />
                <span className="pill category">{rule.category}</span>
              </div>
              <h3>{rule.name}</h3>
              <p>{rule.description}</p>
              <div className="rule-meta">
                <span>Techniques: {formatList(rule.techniques)}</span>
                <span>Connectors: {formatList(rule.connectors)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <h2>High Severity Spotlight</h2>
            <p>Rapid access to the rules that should page an analyst in minutes, not hours.</p>
          </div>
        </div>
        <div className="spotlight-grid">
          {highValueRules.map((rule) => (
            <div key={rule.id} className="spotlight-card">
              <div className="rule-top">
                <SeverityPill value={rule.severity} />
                <span className="pill category">{rule.category}</span>
              </div>
              <h3>{rule.name}</h3>
              <div className="spotlight-row">
                <span className="label">Tactics</span>
                <span>{formatList(rule.tactics)}</span>
              </div>
              <div className="spotlight-row">
                <span className="label">Frequency</span>
                <span>{rule.queryFrequency}</span>
              </div>
              <button className="btn ghost" onClick={() => setSelectedRule(rule)}>
                Inspect Rule
              </button>
            </div>
          ))}
        </div>
      </section>

      {selectedRule ? (
        <section className="drawer" aria-live="polite">
          <div className="drawer-header">
            <div>
              <span className="meta-label">Rule</span>
              <h3>{selectedRule.name}</h3>
            </div>
            <button className="btn ghost" onClick={() => setSelectedRule(null)}>
              Close
            </button>
          </div>
          <div className="drawer-body">
            <div className="drawer-left">
              <div className="detail-row">
                <span className="label">Severity</span>
                <SeverityPill value={selectedRule.severity} />
              </div>
              <div className="detail-row">
                <span className="label">Category</span>
                <span>{selectedRule.category}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tactics</span>
                <span>{formatList(selectedRule.tactics)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Techniques</span>
                <span>{formatList(selectedRule.techniques)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Connectors</span>
                <span>{formatList(selectedRule.connectors)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Data Types</span>
                <span>{formatList(selectedRule.dataTypes)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Schedule</span>
                <span>{selectedRule.queryFrequency} / {selectedRule.queryPeriod}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trigger</span>
                <span>{selectedRule.triggerOperator} {selectedRule.triggerThreshold}</span>
              </div>
              <div className="detail-row">
                <span className="label">False Positives</span>
                <span>{selectedRule.falsePositives}</span>
              </div>
            </div>
            <div className="drawer-right">
              <div className="detail-row">
                <span className="label">Description</span>
                <span>{selectedRule.description}</span>
              </div>
              <div className="detail-row">
                <span className="label">KQL</span>
                <pre className="kql">{selectedRule.query}</pre>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <footer className="footer">
        <div>
          <span className="meta-label">Source</span>
          <span className="meta-value">rules-yaml + KQL metadata</span>
        </div>
        <div>
          <span className="meta-label">Last build</span>
          <span className="meta-value">{buildLabel}</span>
        </div>
      </footer>
    </div>
  );
}
