import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import ArtistsManager from './components/ArtistsManager';
import Spinner from './components/Spinner';
import Skeleton from './components/Skeleton';
import LandingPage from './components/LandingPage';
import TracksManager from './components/TracksManager';
import DashboardPage from './components/DashboardPage';
import DistributionsManager from './components/DistributionsManager';
import DspsManager from './components/DspsManager';

// Protected Route wrapper component using Outlet for nested routes matching
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <Spinner size="xl" message="Loading secure distribution console..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Public Only Route wrapper component to redirect authenticated users away from auth views
function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <Spinner size="xl" message="Loading secure distribution console..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// Dashboard Layout nested container
function DashboardLayout() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex-1 flex w-full bg-background text-foreground transition-colors duration-300 min-h-screen">

      {/* 2. Sidebar Navigation (Desktop) */}
      <aside className="w-72 bg-card border-r border-card-border p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Takwene Music</h1>
              <span className="text-xs text-primary font-bold tracking-wider uppercase">Distribution Hub</span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {[
              { path: '/artists-registry', label: 'Artists Registry', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { path: '/dashboard', label: 'Command Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { path: '/tracks', label: 'Track Catalog', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
              { path: '/distribution', label: 'DSP Deliveries', icon: 'M8.684 10.742l-2.777 1.111A1 1 0 015 11V5a1 1 0 01.908-.553l8-4A1 1 0 0115 1v6M17 11h.01M17 15h.01M17 19h.01M21 11h.01M21 15h.01M21 19h.01' },
              { path: '/dsps', label: 'DSP Registry', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPath === item.path
                    ? 'bg-primary text-primary-foreground shadow-md font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer / API Integration Status */}
        <div className="p-4 rounded-xl bg-muted/60 border border-card-border space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">API Sync Enabled</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Connected to ASP.NET gateway on port <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">5023</code>
          </p>
        </div>
      </aside>

      {/* Mobile Drawer (Backdrop & Drawer content) */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            key="mobile-sidebar-container"
            className="fixed inset-0 z-50 md:hidden flex"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] bg-card border-r border-card-border p-6 flex flex-col justify-between h-full shadow-2xl z-50"
            >
              <div className="space-y-8">
                {/* Logo & Close button */}
                <div className="flex items-center justify-between">
                  <Link to="/" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md">
                      <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="font-bold text-base leading-tight tracking-tight">Takwene Music</h1>
                      <span className="text-[10px] text-primary font-bold tracking-wider uppercase">Distribution Hub</span>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={() => setIsMobileOpen(false)} 
                    className="p-1.5 rounded-lg border border-card-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1.5">
                  {[
                    { path: '/artists-registry', label: 'Artists Registry', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { path: '/dashboard', label: 'Command Center', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
                    { path: '/tracks', label: 'Track Catalog', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
                    { path: '/distribution', label: 'DSP Deliveries', icon: 'M8.684 10.742l-2.777 1.111A1 1 0 015 11V5a1 1 0 01.908-.553l8-4A1 1 0 0115 1v6M17 11h.01M17 15h.01M17 19h.01M21 11h.01M21 15h.01M21 19h.01' },
                    { path: '/dsps', label: 'DSP Registry', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        currentPath === item.path
                          ? 'bg-primary text-primary-foreground shadow-md font-bold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Sidebar Footer */}
              <div className="p-4 rounded-xl bg-muted/60 border border-card-border space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">API Sync Enabled</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Connected to ASP.NET gateway on port <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-primary">5023</code>
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="h-20 bg-card border-b border-card-border px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 relative z-20"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-none">
              {currentPath === '/artists-registry' && 'Artists Registry'}
              {currentPath === '/dashboard' && 'Command Center'}
              {currentPath === '/tracks' && 'Music Track Catalog'}
              {currentPath === '/distribution' && 'DSP Distribution Status'}
              {currentPath === '/dsps' && 'DSP Registry'}
            </h2>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Theme Toggle Button */}
            <div className="flex items-center gap-2 border border-card-border bg-muted/30 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground hidden sm:inline">
                {isDark ? 'Royal Dark' : 'Vibrant Light'}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-sm transition-colors duration-200 cursor-pointer"
                title={`Switch to theme`}
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Profile Avatar & Info and Logout */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-card-border">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="hidden lg:block text-left max-w-[150px] truncate">
                <p className="text-xs font-bold leading-none truncate">{user?.name || 'User'}</p>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">{user?.role || 'Member'}</span>
              </div>
              
              <button
                onClick={logout}
                className="p-1.5 rounded-lg border border-card-border hover:bg-danger/10 hover:text-danger text-muted-foreground transition-all duration-150 ml-1 sm:ml-2 cursor-pointer"
                title="Sign Out"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Auth loading gate
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <Spinner size="xl" message="Loading secure distribution console..." />
      </div>
    );
  }
  return (
    <Routes>
      {/* PUBLIC DEFAULT ROUTE */}
      <Route path="/" element={<LandingPage />} />
      
      {/* AUTH ROUTES FOR PUBLIC ONLY */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage />} />
      </Route>

      {/* PROTECTED ROUTES GROUP */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          
          {/* Artists Registry */}
          <Route path="/artists-registry" element={<ArtistsManager />} />

          {/* Command Center */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Track Catalog */}
          <Route path="/tracks" element={<TracksManager />} />

          {/* DSP Deliveries */}
          <Route path="/distribution" element={<DistributionsManager />} />

          {/* DSP Registry */}
          <Route path="/dsps" element={<DspsManager />} />

        </Route>
      </Route>

      {/* CATCH ALL FALLBACK TO ROUTE '/' */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
