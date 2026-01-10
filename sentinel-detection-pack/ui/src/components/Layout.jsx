import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, AlertTriangle, Target, Search, 
  Settings, Bell, Moon, Sun, Menu, X, Zap, 
  Database, Map, BarChart3, BookOpen, Play,
  ChevronRight, Radio
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn } from '../services/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Activity },
  { name: 'Threat Map', href: '/threat-map', icon: Map },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Detection Rules', href: '/rules', icon: Shield },
  { name: 'MITRE ATT&CK', href: '/mitre', icon: Target },
  { name: 'Investigation', href: '/investigation', icon: Search },
  { name: 'KQL Playground', href: '/kql', icon: Database },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Attack Simulator', href: '/simulator', icon: Zap },
  { name: 'Tutorial', href: '/tutorial', icon: BookOpen },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    theme, 
    toggleTheme, 
    isAttackMode, 
    connectionStatus,
    notifications,
    liveEvents 
  } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === 'dark' 
        ? 'bg-dark-950 text-white' 
        : 'bg-gray-50 text-gray-900'
    )}>
      {/* Background grid pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
      
      {/* Attack mode overlay */}
      <AnimatePresence>
        {isAttackMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <div className="absolute inset-0 border-4 border-red-500/50 animate-pulse" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/50">
              <Radio className="w-4 h-4 animate-pulse" />
              <span className="font-semibold">ATTACK SIMULATION ACTIVE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-50 transition-transform duration-300 lg:translate-x-0",
        "w-64 border-r",
        theme === 'dark' 
          ? 'bg-dark-900/95 border-dark-700 backdrop-blur-xl' 
          : 'bg-white/95 border-gray-200 backdrop-blur-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-inherit">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyber-500" />
              <motion.div
                className="absolute inset-0 bg-cyber-500 rounded-full opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Sentinel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Detection Pack</p>
            </div>
          </Link>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b border-inherit">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-2 h-2 rounded-full",
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            )} />
            <span className="text-gray-500 dark:text-gray-400">
              {connectionStatus === 'connected' ? 'Live Data' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Simulation Mode'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? 'bg-cyber-500/20 text-cyber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "text-cyber-500")} />
                <span>{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-cyber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Events Counter */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-inherit">
          <div className={cn(
            "flex items-center justify-between p-3 rounded-lg",
            theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
          )}>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-500" />
              <span className="text-sm font-medium">Live Events</span>
            </div>
            <span className="text-lg font-bold text-cyber-500">
              {liveEvents.length}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className={cn(
          "sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b",
          theme === 'dark' 
            ? 'bg-dark-900/80 border-dark-700 backdrop-blur-xl' 
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        )}>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className={cn(
            "hidden md:flex items-center gap-2 px-4 py-2 rounded-lg w-96",
            theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
          )}>
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search rules, incidents, entities..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-dark-700 text-gray-500">
              ⌘K
            </kbd>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Attack Mode Toggle */}
            <Link
              to="/simulator"
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isAttackMode
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30'
              )}
            >
              <Play className="w-4 h-4" />
              <span>{isAttackMode ? 'Attack Active' : 'Run Attack'}</span>
            </Link>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
