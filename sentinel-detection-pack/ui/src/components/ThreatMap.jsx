import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, AlertTriangle, TrendingUp, TrendingDown,
  MapPin, Activity, Eye, Filter, RefreshCw
} from 'lucide-react';
import { threatIntelService } from '../services/threatIntelService';
import { useAppStore } from '../store/appStore';
import { cn, formatNumber } from '../services/utils';

// World map coordinates (simplified)
const WORLD_BOUNDS = { minLat: -60, maxLat: 75, minLng: -180, maxLng: 180 };

// Convert geo coordinates to screen position
function geoToScreen(lat, lng, width, height) {
  const x = ((lng - WORLD_BOUNDS.minLng) / (WORLD_BOUNDS.maxLng - WORLD_BOUNDS.minLng)) * width;
  const y = ((WORLD_BOUNDS.maxLat - lat) / (WORLD_BOUNDS.maxLat - WORLD_BOUNDS.minLat)) * height;
  return { x, y };
}

// Attack Line Animation Component
function AttackLine({ from, to, delay = 0, color = '#ef4444' }) {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [from, to]);

  // Create a curved path between points
  const midX = (from.x + to.x) / 2;
  const midY = Math.min(from.y, to.y) - 50;
  const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

  return (
    <g>
      {/* Glow effect */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        opacity="0.3"
        filter="blur(4px)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay, ease: "easeInOut" }}
      />
      {/* Main line */}
      <motion.path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay, ease: "easeInOut" }}
      />
      {/* Moving dot */}
      <motion.circle
        r="4"
        fill={color}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 1.5, delay, repeat: Infinity, repeatDelay: 2 }}
        style={{ offsetPath: `path("${path}")` }}
      />
    </g>
  );
}

// Attack Point Component
function AttackPoint({ x, y, count, name, isActive, onClick }) {
  const size = Math.min(Math.max(count / 100, 8), 30);
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Pulse animation */}
      <motion.circle
        cx={x}
        cy={y}
        r={size + 10}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2"
        opacity="0"
        animate={{
          r: [size, size + 20, size + 30],
          opacity: [0.8, 0.4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
      {/* Main circle */}
      <motion.circle
        cx={x}
        cy={y}
        r={size}
        fill={isActive ? "#ef4444" : "#f97316"}
        opacity="0.8"
        whileHover={{ scale: 1.3 }}
        transition={{ type: "spring", stiffness: 400 }}
      />
      {/* Center dot */}
      <circle cx={x} cy={y} r="3" fill="white" opacity="0.9" />
      {/* Label */}
      {isActive && (
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <rect
            x={x - 40}
            y={y - size - 35}
            width="80"
            height="25"
            rx="4"
            fill="#1e293b"
            stroke="#475569"
          />
          <text
            x={x}
            y={y - size - 18}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            fontWeight="500"
          >
            {name}: {formatNumber(count)}
          </text>
        </motion.g>
      )}
    </g>
  );
}

// Stats Card
function StatsCard({ title, value, change, trend, icon: Icon }) {
  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-500/20">
          <Icon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xl font-bold">{formatNumber(value)}</p>
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm",
            trend === 'up' ? 'text-red-400' : 'text-green-400'
          )}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}%
          </div>
        )}
      </div>
    </div>
  );
}

// Threat Table
function ThreatTable({ threats, title }) {
  return (
    <div className="bg-dark-800/50 rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-4 border-b border-dark-700">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-dark-700/50 max-h-64 overflow-y-auto">
        {threats.map((threat, index) => (
          <div key={index} className="flex items-center gap-3 p-3 hover:bg-dark-700/30">
            <div className={cn(
              "w-2 h-2 rounded-full",
              threat.score >= 90 ? 'bg-red-500' :
              threat.score >= 70 ? 'bg-orange-500' :
              'bg-yellow-500'
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono truncate">{threat.ip || threat.domain}</p>
              <p className="text-xs text-gray-500">{threat.threat || threat.target}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{threat.country || threat.status}</p>
              {threat.score && (
                <p className="text-xs text-red-400">Score: {threat.score}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThreatMap() {
  const [threatData, setThreatData] = useState({});
  const [activePoint, setActivePoint] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [attacks, setAttacks] = useState([]);
  const containerRef = useRef(null);
  const { liveEvents } = useAppStore();

  // Load threat data
  useEffect(() => {
    const loadData = async () => {
      const data = await threatIntelService.getThreatData();
      setThreatData(data);
    };
    loadData();
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: Math.max(400, rect.height) });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate attack lines
  useEffect(() => {
    const targetLocation = { lat: 40.7128, lng: -74.0060 }; // New York (target)
    const targetScreen = geoToScreen(targetLocation.lat, targetLocation.lng, dimensions.width, dimensions.height);

    const interval = setInterval(() => {
      if (threatData.geoAttacks?.length > 0) {
        const source = threatData.geoAttacks[Math.floor(Math.random() * threatData.geoAttacks.length)];
        const sourceScreen = geoToScreen(source.lat, source.lng, dimensions.width, dimensions.height);
        
        const newAttack = {
          id: Date.now(),
          from: sourceScreen,
          to: targetScreen,
          source: source.name,
        };
        
        setAttacks(prev => [...prev.slice(-10), newAttack]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [threatData.geoAttacks, dimensions]);

  // Convert geo data to screen coordinates
  const attackPoints = useMemo(() => {
    if (!threatData.geoAttacks) return [];
    return threatData.geoAttacks.map(attack => ({
      ...attack,
      screen: geoToScreen(attack.lat, attack.lng, dimensions.width, dimensions.height)
    }));
  }, [threatData.geoAttacks, dimensions]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAttacks = threatData.geoAttacks?.reduce((sum, a) => sum + a.count, 0) || 0;
    return {
      totalAttacks,
      maliciousIPs: threatData.maliciousIPs?.length || 0,
      c2Servers: threatData.c2Servers?.length || 0,
      phishingDomains: threatData.phishingDomains?.length || 0,
    };
  }, [threatData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyber-500" />
            Global Threat Map
          </h1>
          <p className="text-gray-400 mt-1">Real-time visualization of attack origins and threat intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-cyber-500/50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Attacks (24h)" value={stats.totalAttacks} change={12} trend="up" icon={AlertTriangle} />
        <StatsCard title="Malicious IPs" value={stats.maliciousIPs} icon={MapPin} />
        <StatsCard title="Active C2 Servers" value={stats.c2Servers} change={-3} trend="down" icon={Activity} />
        <StatsCard title="Phishing Domains" value={stats.phishingDomains} icon={Eye} />
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="relative bg-dark-900 rounded-xl border border-dark-700 overflow-hidden"
        style={{ height: '500px' }}
      >
        {/* World Map SVG */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="absolute inset-0"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Simplified world outline (dots representing continents) */}
          <g opacity="0.3">
            {/* North America */}
            <ellipse cx={dimensions.width * 0.2} cy={dimensions.height * 0.35} rx="80" ry="60" fill="#475569" />
            {/* South America */}
            <ellipse cx={dimensions.width * 0.25} cy={dimensions.height * 0.65} rx="40" ry="70" fill="#475569" />
            {/* Europe */}
            <ellipse cx={dimensions.width * 0.5} cy={dimensions.height * 0.3} rx="50" ry="40" fill="#475569" />
            {/* Africa */}
            <ellipse cx={dimensions.width * 0.52} cy={dimensions.height * 0.55} rx="45" ry="60" fill="#475569" />
            {/* Asia */}
            <ellipse cx={dimensions.width * 0.7} cy={dimensions.height * 0.35} rx="100" ry="60" fill="#475569" />
            {/* Australia */}
            <ellipse cx={dimensions.width * 0.85} cy={dimensions.height * 0.7} rx="40" ry="30" fill="#475569" />
          </g>

          {/* Attack lines */}
          <AnimatePresence>
            {attacks.map((attack, index) => (
              <AttackLine
                key={attack.id}
                from={attack.from}
                to={attack.to}
                delay={index * 0.1}
              />
            ))}
          </AnimatePresence>

          {/* Attack points */}
          {attackPoints.map((point, index) => (
            <AttackPoint
              key={point.code}
              x={point.screen.x}
              y={point.screen.y}
              count={point.count}
              name={point.name}
              isActive={activePoint === point.code}
              onClick={() => setActivePoint(activePoint === point.code ? null : point.code)}
            />
          ))}

          {/* Target marker (your infrastructure) */}
          <g>
            <motion.circle
              cx={dimensions.width * 0.22}
              cy={dimensions.height * 0.38}
              r="15"
              fill="#14b8a6"
              opacity="0.3"
              animate={{ r: [15, 25, 15] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <circle
              cx={dimensions.width * 0.22}
              cy={dimensions.height * 0.38}
              r="8"
              fill="#14b8a6"
            />
            <text
              x={dimensions.width * 0.22}
              y={dimensions.height * 0.38 + 30}
              textAnchor="middle"
              fill="#14b8a6"
              fontSize="12"
              fontWeight="600"
            >
              YOUR INFRASTRUCTURE
            </text>
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 border border-dark-700">
          <p className="text-xs text-gray-400 mb-2">Attack Volume</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">High</span>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-dark-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-dark-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm">Live</span>
        </div>
      </div>

      {/* Threat Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThreatTable 
          threats={threatData.maliciousIPs || []} 
          title="Malicious IP Addresses" 
        />
        <ThreatTable 
          threats={threatData.phishingDomains || []} 
          title="Active Phishing Domains" 
        />
      </div>

      {/* Recent Attacks by Type */}
      <div className="bg-dark-800/50 rounded-xl border border-dark-700 p-4">
        <h3 className="font-semibold mb-4">Attack Trends (Last 7 Days)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(threatData.recentAttacks || []).map((attack, index) => (
            <div 
              key={attack.type}
              className="p-4 rounded-lg bg-dark-700/50 text-center"
            >
              <p className="text-2xl font-bold">{formatNumber(attack.count)}</p>
              <p className="text-sm text-gray-400 mt-1">{attack.type}</p>
              <div className={cn(
                "flex items-center justify-center gap-1 mt-2 text-xs",
                attack.trend === 'up' ? 'text-red-400' : 'text-green-400'
              )}>
                {attack.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(attack.change)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
