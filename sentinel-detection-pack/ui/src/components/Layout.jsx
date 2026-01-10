import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, AlertTriangle, Target, Search, 
  Settings, Bell, Moon, Sun, Menu, X, Zap, 
  Database, Map, BarChart3, BookOpen, Play,
  ChevronRight, Radio, ChevronLeft, Check, Trash2,
  ExternalLink, Clock
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { cn, formatRelativeTime, getSeverityBadge } from '../services/utils';

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

// Notification Panel Component
function NotificationPanel({ isOpen, onClose, notifications, onMarkRead, onDismiss, onClear }) {
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    onMarkRead(notification.id);
    if (notification.incidentId) {
      navigate(`/incidents?highlight=${notification.incidentId}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyber-500" />
                <span className="font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[50vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 border-b border-dark-700/50 cursor-pointer hover:bg-dark-700/50 transition-colors",
                      !notification.read && "bg-cyber-500/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notification.severity === 'Critical' ? 'bg-red-500' :
                        notification.severity === 'High' ? 'bg-orange-500' :
                        notification.severity === 'Medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          !notification.read && "font-medium"
                        )}>{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(notification.id); }}
                        className="p-1 hover:bg-dark-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const { 
    theme, 
    toggleTheme, 
    isAttackMode, 
    connectionStatus,
    notifications,
    dismissNotification,
    markNotificationRead,
    clearNotifications,
    liveEvents,
    sidebarCollapsed,
    toggleSidebar
  } = useAppStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('[data-search-input]')?.focus();
      }
      // Escape to close modals/panels
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setNotificationsOpen(false);
      }
      // Ctrl/Cmd + number for navigation
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (navigation[index]) {
          e.preventDefault();
          navigate(navigation[index].href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

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
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 sm:px-6 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/50 text-xs sm:text-sm">
              <Radio className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
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
        "fixed left-0 top-0 h-full z-50 transition-all duration-300 lg:translate-x-0",
        "border-r",
        theme === 'dark' 
          ? 'bg-dark-900/95 border-dark-700 backdrop-blur-xl' 
          : 'bg-white/95 border-gray-200 backdrop-blur-xl',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'
      )}>
        {/* Logo */}
        <div className="h-14 sm:h-16 flex items-center px-3 sm:px-6 border-b border-inherit">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-shrink-0">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-cyber-500" />
              <motion.div
                className="absolute inset-0 bg-cyber-500 rounded-full opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-base sm:text-lg tracking-tight">Sentinel</h1>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Detection Pack</p>
              </div>
            )}
          </Link>
          <button 
            className="ml-auto lg:hidden p-2"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          {/* Collapse button - desktop only */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex ml-auto p-1 rounded hover:bg-dark-700"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Connection Status */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 sm:py-3 border-b border-inherit">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              )} />
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {connectionStatus === 'connected' ? 'Live Data Active' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Demo Mode'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "p-2 sm:p-4 space-y-1 overflow-y-auto",
          sidebarCollapsed ? 'h-[calc(100vh-120px)]' : 'h-[calc(100vh-200px)]'
        )}>
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200",
                  sidebarCollapsed && "justify-center",
                  isActive
                    ? 'bg-cyber-500/20 text-cyber-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0", isActive && "text-cyber-500")} />
                {!sidebarCollapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-cyber-500 flex-shrink-0" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Events Counter */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-inherit">
            <div className={cn(
              "flex items-center justify-between p-2 sm:p-3 rounded-lg",
              theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
            )}>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Live Events</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-cyber-500">
                {liveEvents.length}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}>
        {/* Top bar */}
        <header className={cn(
          "sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b gap-2 sm:gap-4",
          theme === 'dark' 
            ? 'bg-dark-900/80 border-dark-700 backdrop-blur-xl' 
            : 'bg-white/80 border-gray-200 backdrop-blur-xl'
        )}>
          <button 
            className="lg:hidden p-2 -ml-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Search */}
          <div className={cn(
            "hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg flex-1 max-w-sm lg:max-w-md",
            theme === 'dark' ? 'bg-dark-800' : 'bg-gray-100'
          )}>
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              data-search-input
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-full"
            />
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-gray-200 dark:bg-dark-700 text-gray-500 flex-shrink-0">
              ⌘K
            </kbd>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Attack Mode Toggle */}
            <Link
              to="/simulator"
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all",
                isAttackMode
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-cyber-500/20 text-cyber-400 hover:bg-cyber-500/30'
              )}
            >
              <Play className="w-4 h-4" />
              <span className="hidden md:inline">{isAttackMode ? 'Attack Active' : 'Run Attack'}</span>
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              
              <NotificationPanel
                isOpen={notificationsOpen}
                onClose={() => setNotificationsOpen(false)}
                notifications={notifications}
                onMarkRead={markNotificationRead}
                onDismiss={dismissNotification}
                onClear={clearNotifications}
              />
            </div>

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

            {/* Settings - hidden on mobile */}
            <button className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3 sm:p-6">
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
