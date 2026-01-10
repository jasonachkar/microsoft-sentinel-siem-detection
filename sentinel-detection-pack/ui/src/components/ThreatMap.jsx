import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, AlertTriangle, TrendingUp, TrendingDown,
  RefreshCw, Activity, MapPin, Clock, Shield,
  Skull, Link2, ExternalLink, Copy, Check,
  Wifi, WifiOff, AlertCircle
} from 'lucide-react';
import { cn, formatRelativeTime, getSeverityBadge } from '../services/utils';
import { threatIntelService } from '../services/threatIntelService';
import { useAppStore } from '../store/appStore';

// World map SVG
const WorldMap = ({ attacks, selectedCountry, onCountryClick }) => {
  const countries = [
    { code: 'US', name: 'United States', path: 'M 50 120 L 180 120 L 180 180 L 50 180 Z', cx: 115, cy: 150 },
    { code: 'RU', name: 'Russia', path: 'M 400 50 L 600 50 L 600 120 L 400 120 Z', cx: 500, cy: 85 },
    { code: 'CN', name: 'China', path: 'M 500 130 L 600 130 L 600 180 L 500 180 Z', cx: 550, cy: 155 },
    { code: 'DE', name: 'Germany', path: 'M 320 90 L 350 90 L 350 120 L 320 120 Z', cx: 335, cy: 105 },
    { code: 'NL', name: 'Netherlands', path: 'M 310 85 L 330 85 L 330 100 L 310 100 Z', cx: 320, cy: 92 },
    { code: 'FR', name: 'France', path: 'M 290 100 L 330 100 L 330 140 L 290 140 Z', cx: 310, cy: 120 },
    { code: 'BR', name: 'Brazil', path: 'M 150 220 L 220 220 L 220 290 L 150 290 Z', cx: 185, cy: 255 },
    { code: 'IN', name: 'India', path: 'M 480 160 L 530 160 L 530 220 L 480 220 Z', cx: 505, cy: 190 },
    { code: 'UA', name: 'Ukraine', path: 'M 370 95 L 410 95 L 410 115 L 370 115 Z', cx: 390, cy: 105 },
    { code: 'KR', name: 'South Korea', path: 'M 570 140 L 590 140 L 590 160 L 570 160 Z', cx: 580, cy: 150 },
    { code: 'JP', name: 'Japan', path: 'M 590 130 L 620 130 L 620 170 L 590 170 Z', cx: 605, cy: 150 },
    { code: 'AU', name: 'Australia', path: 'M 550 250 L 630 250 L 630 310 L 550 310 Z', cx: 590, cy: 280 },
    { code: 'GB', name: 'United Kingdom', path: 'M 290 80 L 310 80 L 310 100 L 290 100 Z', cx: 300, cy: 90 },
  ];

  const getCountryAttacks = (code) => attacks.find(a => a.code === code);

  return (
    <svg viewBox="0 0 700 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="attackGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="700" height="350" fill="#111827" rx="8" />

      {/* Grid */}
      {[...Array(7)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50} x2="700" y2={i * 50} stroke="#1f2937" strokeWidth="0.5" />
      ))}
      {[...Array(14)].map((_, i) => (
        <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="350" stroke="#1f2937" strokeWidth="0.5" />
      ))}

      {/* Countries */}
      {countries.map((country) => {
        const attackData = getCountryAttacks(country.code);
        const intensity = attackData ? Math.min(attackData.count / 20, 1) : 0;

        return (
          <g key={country.code}>
            <path
              d={country.path}
              fill={attackData ? `rgba(239, 68, 68, ${intensity * 0.5 + 0.1})` : '#374151'}
              stroke={selectedCountry === country.code ? '#22d3ee' : '#4b5563'}
              strokeWidth={selectedCountry === country.code ? 2 : 1}
              className="cursor-pointer transition-all hover:stroke-cyan-500"
              onClick={() => onCountryClick(country.code)}
            />
            {attackData && attackData.count > 0 && (
              <>
                <circle
                  cx={country.cx}
                  cy={country.cy}
                  r={Math.min(attackData.count / 2, 15)}
                  fill="url(#attackGlow)"
                  className="animate-pulse"
                />
                <circle cx={country.cx} cy={country.cy} r="3" fill="#ef4444" filter="url(#glow)" />
              </>
            )}
          </g>
        );
      })}

      {/* Attack lines */}
      {attacks.slice(0, 5).map((attack, i) => {
        const source = countries.find(c => c.code === attack.code);
        const target = { cx: 115, cy: 150 };
        if (!source || attack.code === 'US') return null;

        return (
          <g key={`line-${i}`}>
            <line
              x1={source.cx} y1={source.cy} x2={target.cx} y2={target.cy}
              stroke="#ef444480" strokeWidth="1" strokeDasharray="4,4" className="animate-pulse"
            />
            <circle r="2" fill="#ef4444">
              <animateMotion dur={`${3 + i}s`} repeatCount="indefinite" path={`M${source.cx},${source.cy} L${target.cx},${target.cy}`} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
};

// Attack Trend Card
function TrendCard({ trend }) {
  return (
    <div className="p-3 sm:p-4 bg-dark-800/50 rounded-lg border border-dark-700">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium truncate">{trend.type}</span>
        <div className={cn(
          "flex items-center gap-1 text-[10px] sm:text-xs flex-shrink-0",
          trend.trend === 'up' ? 'text-red-400' : 'text-green-400'
        )}>
          {trend.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(parseFloat(trend.change))}%
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2">{trend.count.toLocaleString()}</p>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 24 hours</p>
    </div>
  );
}

// C2 Server Card
function C2ServerCard({ server }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(server.ip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-2 sm:p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            server.status === 'online' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
          )} />
          <code className="text-xs sm:text-sm font-mono truncate">{server.ip}</code>
        </div>
        <button
          onClick={copy}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-dark-600 rounded transition-all flex-shrink-0"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-500 flex-wrap">
        <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{server.malware}</span>
        <span>:{server.port}</span>
        <span>{server.country}</span>
      </div>
    </div>
  );
}

// Malicious URL Card
function URLCard({ url }) {
  return (
    <div className="p-2 sm:p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors">
      <div className="flex items-start gap-2">
        <Link2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-sm font-mono truncate" title={url.url}>{url.url}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-gray-500 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">{url.threat}</span>
            <span className={cn(
              "px-1.5 py-0.5 rounded",
              url.status === 'online' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
            )}>{url.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThreatMap() {
  const { setConnectionStatus, setThreatIntel } = useAppStore();
  const [threatData, setThreatData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);
  const refreshInterval = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear cache to force fresh fetch
      threatIntelService.clearCache();
      const data = await threatIntelService.getThreatData();
      setThreatData(data);
      setThreatIntel(data);
      setLastUpdated(new Date());
      setConnectionStatus(data.isRealData ? 'connected' : 'disconnected');
      
      if (data.error && !data.isRealData) {
        setError('Could not fetch live data. Showing demo data.');
      }
    } catch (error) {
      console.error('Failed to fetch threat data:', error);
      setError('Failed to fetch threat data');
      setConnectionStatus('disconnected');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchData, 5 * 60 * 1000);
    }

    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [autoRefresh]);

  const selectedCountryData = useMemo(() => {
    if (!selectedCountry || !threatData) return null;
    return threatData.geoAttacks?.find(a => a.code === selectedCountry);
  }, [selectedCountry, threatData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500" />
            Global Threat Map
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Real-time threat intelligence
            {threatData?.isRealData && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                <Wifi className="w-3 h-3" /> LIVE DATA
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {lastUpdated && (
            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(lastUpdated.toISOString())}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-gray-400'
            )}
            title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-xs sm:text-sm disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-400">{error}</p>
            <p className="text-xs text-gray-400 mt-1">
              This is normal if your browser blocks cross-origin requests. The demo data is still representative.
            </p>
          </div>
        </div>
      )}

      {/* Data Sources */}
      {threatData?.sources && (
        <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-xs text-gray-500">Data Sources:</span>
          <div className="flex flex-wrap gap-2">
            {threatData.sources.map((source, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-dark-700 text-gray-300">
                {source}
              </span>
            ))}
          </div>
          {threatData.lastUpdated && (
            <span className="text-xs text-gray-500 sm:ml-auto">
              Last fetch: {new Date(threatData.lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Attack Trends */}
      {threatData?.recentAttacks && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {threatData.recentAttacks.map(trend => (
            <TrendCard key={trend.type} trend={trend} />
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* World Map */}
        <div className="xl:col-span-2">
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Attack Source Geography
              </h3>
              {selectedCountryData && (
                <button
                  onClick={() => setSelectedCountry(null)}
                  className="text-[10px] sm:text-xs text-gray-400 hover:text-white"
                >
                  Clear selection
                </button>
              )}
            </div>
            <div className="p-2 sm:p-4">
              <WorldMap
                attacks={threatData?.geoAttacks || []}
                selectedCountry={selectedCountry}
                onCountryClick={setSelectedCountry}
              />
              
              <AnimatePresence>
                {selectedCountryData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 sm:p-4 bg-dark-700/50 rounded-lg border border-dark-600"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                        <Globe className="w-4 h-4 text-cyan-500" />
                        {selectedCountryData.name || selectedCountryData.country}
                      </h4>
                      <span className="text-xl sm:text-2xl font-bold text-red-400">
                        {selectedCountryData.count} C2s
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* C2 Servers & Malicious URLs */}
        <div className="space-y-4">
          {/* C2 Servers */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
                <Skull className="w-4 h-4 text-red-500" />
                Active C2 Servers
              </h3>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                {threatData?.c2Servers?.length || 0}
              </span>
            </div>
            <div className="p-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto space-y-2">
              {threatData?.c2Servers?.slice(0, 10).map((server, i) => (
                <C2ServerCard key={`${server.ip}-${i}`} server={server} />
              ))}
              {!threatData?.c2Servers?.length && (
                <p className="text-center py-8 text-gray-500 text-sm">Loading...</p>
              )}
            </div>
          </div>

          {/* Malicious URLs */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-dark-700 flex items-center justify-between">
              <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-orange-500" />
                Malicious URLs
              </h3>
              <a
                href="https://urlhaus.abuse.ch/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                URLhaus <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="p-2 max-h-[200px] sm:max-h-[250px] overflow-y-auto space-y-2">
              {threatData?.maliciousURLs?.slice(0, 8).map((url, i) => (
                <URLCard key={i} url={url} />
              ))}
              {!threatData?.maliciousURLs?.length && (
                <p className="text-center py-8 text-gray-500 text-sm">Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IP Blocklist */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-dark-700 flex items-center justify-between">
          <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            Malicious IP Blocklist
          </h3>
          <span className="text-[10px] sm:text-xs text-gray-500">
            {threatData?.maliciousIPs?.length || 0} IPs from threat feeds
          </span>
        </div>
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {threatData?.maliciousIPs?.slice(0, 40).map((item, i) => (
              <motion.div
                key={`${item.ip}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                title={`${item.threat} - Score: ${item.score}`}
              >
                <code className="text-[10px] sm:text-xs font-mono text-red-400">{item.ip}</code>
                <span className="text-[8px] sm:text-[10px] text-red-300 px-1 py-0.5 bg-red-500/20 rounded">
                  {item.score || '?'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
