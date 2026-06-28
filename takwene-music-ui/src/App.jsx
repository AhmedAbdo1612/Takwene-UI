import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axiosClient from './api/axiosClient';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import ArtistsManager from './components/ArtistsManager';
import Spinner from './components/Spinner';
import Skeleton from './components/Skeleton';

// Mock database matching Domain structures in context.md
const MOCK_TRACKS = [
  { id: '101', title: 'Kifak Inta', artist: 'Fairuz', status: 'Distributed', duration: '3:45', dspCount: 3, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: '102', title: 'Tamally Maak', artist: 'Amr Diab', status: 'Submitted', duration: '4:12', dspCount: 1, coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: '103', title: 'Rita', artist: 'Marcel Khalife', status: 'Draft', duration: '5:02', dspCount: 0, coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
];

const MOCK_DISTRIBUTIONS = [
  { trackId: '101', trackTitle: 'Kifak Inta', dsp: 'Spotify', status: 'Delivered', date: '2026-06-25' },
  { trackId: '101', trackTitle: 'Kifak Inta', dsp: 'Apple Music', status: 'Delivered', date: '2026-06-25' },
  { trackId: '101', trackTitle: 'Kifak Inta', dsp: 'Deezer', status: 'Delivered', date: '2026-06-26' },
  { trackId: '102', trackTitle: 'Tamally Maak', dsp: 'Spotify', status: 'Pending', date: '2026-06-27' },
];

export default function App() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Simulation loading states
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);
  const [isInlineLoading, setIsInlineLoading] = useState(false);
  const [simulatedApiStatus, setSimulatedApiStatus] = useState('idle');
  
  // React Query hooks to consume live database endpoints
  const { data: tracksData = [], isLoading: isTracksLoading, refetch: refetchTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      try {
        const res = await axiosClient.get('api/tracks');
        return Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        return [];
      }
    },
    enabled: isAuthenticated && currentPath === '/tracks',
  });

  const { data: distributionsData = [], isLoading: isDistLoading, refetch: refetchDistributions } = useQuery({
    queryKey: ['distributions'],
    queryFn: async () => {
      try {
        const res = await axiosClient.get('api/track-distributions');
        return Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.error('Error fetching distributions:', err);
        return [];
      }
    },
    enabled: isAuthenticated && currentPath === '/distribution',
  });

  // Fallback to MOCK data if backend is empty or offline
  const displayTracks = tracksData.length > 0 ? tracksData : MOCK_TRACKS;
  const displayDistributions = distributionsData.length > 0 ? distributionsData : MOCK_DISTRIBUTIONS;

  // Trigger fullscreen loader for 2 seconds
  const triggerFullScreenLoader = () => {
    setIsFullScreenLoading(true);
    setTimeout(() => {
      setIsFullScreenLoading(false);
    }, 2000);
  };

  // Trigger inline loading state simulation
  const triggerInlineLoading = () => {
    setIsInlineLoading(true);
    setTimeout(() => {
      setIsInlineLoading(false);
    }, 1500);
  };

  const triggerSimulatedRequest = (outcome) => {
    setSimulatedApiStatus('loading');
    setTimeout(() => {
      setSimulatedApiStatus(outcome);
    }, 1500);
  };

  // Auth loading gate
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <Spinner size="xl" message="Loading secure distribution console..." />
      </div>
    );
  }

  // Auth gate
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="flex-1 flex w-full bg-background text-foreground transition-colors duration-300">
      
      {/* 1. Fullscreen Loader Overlay */}
      {isFullScreenLoading && (
        <Spinner 
          fullScreen 
          size="xl" 
          message="Simulating secure API connection and token validation..." 
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside className="w-72 bg-card border-r border-card-border p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">Takwene Music</h1>
              <span className="text-xs text-primary font-bold tracking-wider uppercase">Distribution Hub</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {[
              { path: '/', label: 'Artists Registry', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { path: '/dashboard', label: 'Dashboard Control', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z' },
              { path: '/tracks', label: 'Track Catalog', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z' },
              { path: '/distribution', label: 'DSP Deliveries', icon: 'M8.684 10.742l-2.777 1.111A1 1 0 015 11V5a1 1 0 01.908-.553l8-4A1 1 0 0115 1v6M17 11h.01M17 15h.01M17 19h.01M21 11h.01M21 15h.01M21 19h.01' },
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

      {/* 3. Main Dashboard Layout Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="h-20 bg-card border-b border-card-border px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-muted">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold tracking-tight">
              {currentPath === '/' && 'Artists Registry'}
              {currentPath === '/dashboard' && 'Dashboard Overview'}
              {currentPath === '/tracks' && 'Music Track Catalog'}
              {currentPath === '/distribution' && 'DSP Distribution Status'}
            </h2>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <div className="flex items-center gap-2 border border-card-border bg-muted/30 px-3.5 py-1.5 rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isDark ? 'Royal Dark' : 'Vibrant Light'}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-1.5 rounded-full bg-primary text-primary-foreground shadow-sm transition-colors duration-200 cursor-pointer"
                title={`Switch to theme`}
              >
                {isDark ? (
                  // Sun Icon for Light Mode
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  // Moon Icon for Dark Mode
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Profile Avatar & Info and Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-card-border">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="hidden lg:block text-left max-w-[150px] truncate">
                <p className="text-xs font-bold leading-none truncate">{user?.name || 'User'}</p>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase">{user?.role || 'Member'}</span>
              </div>
              
              <button
                onClick={logout}
                className="p-1.5 rounded-lg border border-card-border hover:bg-danger/10 hover:text-danger text-muted-foreground transition-all duration-150 ml-2 cursor-pointer"
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
          
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              
              {/* DEFAULT DASHBOARD FALLBACK ROUTE: ARTISTS */}
              <Route path="/" element={<ArtistsManager />} />
              
              {/* ROUTE 2: DASHBOARD CONTROL */}
              <Route path="/dashboard" element={
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8"
                >
                  {/* Hero Welcome banner */}
                  <div className="relative rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-xl overflow-hidden">
                    <div className="relative z-10 space-y-3 max-w-xl">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">Active Session Mapped</span>
                      <h3 className="text-3xl font-extrabold tracking-tight">Welcome, {user?.name || 'Manager'}!</h3>
                      <p className="text-white/80 text-sm leading-relaxed">
                        You are authenticated as a <strong>{user?.role}</strong>. Secure JWT Bearer tokens are stored locally and will rotate automatically on refresh calls.
                      </p>
                    </div>
                    <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  </div>

                  {/* Grid Layout of configurations */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Spinner Showcase */}
                    <section className="bg-card border border-card-border rounded-xl p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg tracking-tight">Action Button Spinners</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Framer Motion animated buttons containing embedded loaders. Perfect for preventing double submissions.
                        </p>
                      </div>

                      <div className="py-4 border-y border-card-border/80 flex flex-wrap gap-6 items-center justify-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <Spinner size="sm" />
                          <span className="text-[10px] text-muted-foreground font-semibold">Small spinner</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <Spinner size="md" />
                          <span className="text-[10px] text-muted-foreground font-semibold">Medium spinner</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <button
                          onClick={triggerFullScreenLoader}
                          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 px-4 rounded-lg shadow transition-all duration-200 cursor-pointer"
                        >
                          Trigger Fullscreen Overlay Spinner
                        </button>
                        
                        <button
                          onClick={triggerInlineLoading}
                          disabled={isInlineLoading}
                          className="w-full flex items-center justify-center gap-2 border border-card-border bg-card hover:bg-muted text-foreground font-semibold text-xs py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                          {isInlineLoading ? (
                            <>
                              <Spinner size="sm" className="mr-1" />
                              Processing distribution flow...
                            </>
                          ) : (
                            'Simulate Action Button Spinner'
                          )}
                        </button>
                      </div>
                    </section>

                    {/* Column 2: API Requirements & Envelope Simulation */}
                    <section className="bg-card border border-card-border rounded-xl p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg tracking-tight">API Request Simulation</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Simulate payload parsing under the <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">ApiResponse&lt;T&gt;</code> structure.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted flex items-center justify-center min-h-[120px] relative border border-card-border">
                        {simulatedApiStatus === 'loading' && (
                          <Spinner size="md" message="Resolving Axios interceptors..." />
                        )}
                        {simulatedApiStatus === 'idle' && (
                          <span className="text-xs text-muted-foreground font-medium italic">Select simulated output</span>
                        )}
                        {simulatedApiStatus === 'success' && (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-1">
                            <span className="inline-flex p-2 rounded-full bg-success/20 text-success text-xs font-bold">✓ Envelope Unwrapped</span>
                            <pre className="text-[10px] text-muted-foreground font-mono bg-card p-1.5 rounded mt-2 border border-card-border max-w-[220px] overflow-x-auto">
                              {`{\n  "isSuccess": true,\n  "data": { "distributedTracks": 18 }\n}`}
                            </pre>
                          </motion.div>
                        )}
                        {simulatedApiStatus === 'error' && (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-1">
                            <span className="inline-flex p-2 rounded-full bg-danger/20 text-danger text-xs font-bold">✗ API Exception (RFC 7807)</span>
                            <p className="text-[11px] text-danger font-medium mt-2 max-w-[200px]">
                              Track status constraint violation. (400 Bad Request)
                            </p>
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerSimulatedRequest('success')}
                          disabled={simulatedApiStatus === 'loading'}
                          className="bg-card border border-card-border hover:bg-muted text-foreground font-bold text-xs py-2 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                          Simulate Success
                        </button>
                        <button
                          onClick={() => triggerSimulatedRequest('error')}
                          disabled={simulatedApiStatus === 'loading'}
                          className="bg-card border border-card-border hover:bg-muted text-foreground font-bold text-xs py-2 px-3 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                        >
                          Simulate Error
                        </button>
                      </div>
                    </section>

                    {/* Column 3: Theme Systems Info */}
                    <section className="bg-card border border-card-border rounded-xl p-6 flex flex-col justify-between space-y-6">
                      <div className="space-y-2">
                        <h4 className="font-bold text-lg tracking-tight">Custom Theme Settings</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Detailed variable tokens registered inside the compiler matching active configurations:
                        </p>
                      </div>

                      <div className="space-y-3.5 text-xs text-muted-foreground">
                        <div className="flex gap-2.5 items-center">
                          <span className="w-4 h-4 rounded bg-primary shrink-0" />
                          <p><strong>Primary Color</strong>: indigo-600 / purple-500</p>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className="w-4 h-4 rounded bg-secondary shrink-0" />
                          <p><strong>Secondary Color</strong>: indigo-500 / royal navy</p>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className="w-4 h-4 rounded bg-card-border border border-muted-foreground/30 shrink-0" />
                          <p><strong>Borders</strong>: slate-200 / deep lavender</p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/60 border border-card-border rounded-lg text-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Persistent Session Sync</span>
                        <span className="text-xs font-semibold text-primary mt-1 block">Saves preference via localStorage</span>
                      </div>
                    </section>
                  </div>
                </motion.div>
              } />

              {/* ROUTE 3: TRACK CATALOG */}
              <Route path="/tracks" element={
                <motion.div
                  key="tracks"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">Track Catalog</h3>
                      <p className="text-xs text-muted-foreground mt-1">Overview of tracks, release statuses, and cover imagery.</p>
                    </div>
                    <button
                      onClick={refetchTracks}
                      disabled={isTracksLoading}
                      className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2 px-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {isTracksLoading && <Spinner size="sm" />}
                      Refresh Grid
                    </button>
                  </div>

                  {isTracksLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Skeleton variant="card" />
                      <Skeleton variant="card" />
                      <Skeleton variant="card" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {displayTracks.map((track) => {
                        const id = track.id || track.Id || Math.random().toString();
                        const title = track.title || track.Title || 'Untitled';
                        const artistName = typeof track.artist === 'object' ? (track.artist?.name || track.artist?.Name) : (track.artist || track.Artist || 'Unknown Artist');
                        const status = track.status || track.Status || 'Draft';
                        const duration = track.duration || track.Duration || '0:00';
                        const dspCount = track.dspCount !== undefined ? track.dspCount : (track.DspCount !== undefined ? track.DspCount : (track.trackDistributions?.length || track.TrackDistributions?.length || 0));
                        const coverUrl = track.coverUrl || track.CoverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80';
                        return (
                          <div
                            key={id}
                            className="border border-card-border bg-card rounded-xl p-5 space-y-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200"
                          >
                            <div className="w-full aspect-video rounded-lg overflow-hidden relative group">
                              <img
                                src={coverUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
                                {duration}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="font-bold text-sm leading-none">{title}</h4>
                              <p className="text-xs text-muted-foreground">{artistName}</p>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-card-border/60">
                              <span className="text-[10px] text-muted-foreground font-semibold">
                                {dspCount > 0 ? `Delivered to ${dspCount} DSPs` : 'Not distributed'}
                              </span>
                              
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                status === 'Distributed' ? 'bg-success/15 text-success' :
                                status === 'Submitted' ? 'bg-warning/15 text-warning' :
                                'bg-muted-foreground/15 text-muted-foreground'
                              }`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              } />

              {/* ROUTE 4: DSP DELIVERIES */}
              <Route path="/distribution" element={
                <motion.div
                  key="distribution"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">DSP Deliveries</h3>
                      <p className="text-xs text-muted-foreground mt-1">Audit trail of track distributions to Digital Service Providers.</p>
                    </div>
                    <button
                      onClick={refetchDistributions}
                      disabled={isDistLoading}
                      className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2 px-3.5 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {isDistLoading && <Spinner size="sm" />}
                      Refresh Table
                    </button>
                  </div>

                  {isDistLoading ? (
                    <Skeleton variant="list" count={4} />
                  ) : (
                    <div className="border border-card-border bg-card rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-muted/50 border-b border-card-border text-muted-foreground font-bold tracking-wide uppercase">
                              <th className="p-4">Track Info</th>
                              <th className="p-4">Provider</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Delivery Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-card-border/80">
                            {displayDistributions.map((item, idx) => {
                              const trackTitle = item.trackTitle || item.TrackTitle || item.track?.title || item.Track?.Title || 'Unknown Track';
                              const dsp = typeof item.dsp === 'object' ? (item.dsp?.name || item.dsp?.Name) : (item.dsp || item.Dsp || 'Unknown DSP');
                              const status = item.status || item.Status || 'Pending';
                              const date = item.date || item.Date || item.deliveredAt || item.DeliveredAt || item.createdAt || item.CreatedAt || 'N/A';
                              return (
                                <tr key={idx} className="hover:bg-muted/20 transition-colors duration-150">
                                  <td className="p-4 font-bold">{trackTitle}</td>
                                  <td className="p-4 font-semibold text-primary">{dsp}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      status === 'Delivered' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                                    }`}>
                                      {status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-muted-foreground font-medium">{date}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              } />

              {/* CATCH ALL FALLBACK TO ROUTE '/' */}
              <Route path="*" element={<Navigate to="/" replace />} />
              
            </Routes>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
