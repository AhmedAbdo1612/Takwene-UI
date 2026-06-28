import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);

  const insights = [
    {
      title: "DSP Ingestion Upgrade",
      description: "Spotify ingestion schemas updated to v4 protocol. High-res audio transcode profiles are now fully verified.",
      badge: "System Update",
      color: "from-purple-500/20 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
    },
    {
      title: "Apple Music Pop Trends",
      description: "Arabic Pop streaming volume rose by 14.2% across North Africa DSP portals this past quarter.",
      badge: "Market Analytics",
      color: "from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
    },
    {
      title: "Catalog Health Check",
      description: "100% of ISRC mappings successfully verified and synced with Global Metadata Registry logs.",
      badge: "Registry Sync",
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    },
    {
      title: "API Performance Peak",
      description: "Ingestion gateway endpoint latencies optimized by 180ms through edge cache route caching.",
      badge: "Infrastructure",
      color: "from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const stats = [
    {
      label: "Catalog Size",
      value: "148 Tracks",
      change: "+12 releases this month",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: "text-purple-500",
      bgClass: "bg-purple-500/10 border-purple-500/20",
      trend: "up"
    },
    {
      label: "Artist Registry",
      value: "34 Artists",
      change: "Verified creators active",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: "text-emerald-500",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      trend: "neutral"
    },
    {
      label: "Active Outlets",
      value: "8 DSPs",
      change: "Global reach expanded",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: "text-sky-500",
      bgClass: "bg-sky-500/10 border-sky-500/20",
      trend: "up"
    },
    {
      label: "Successful Shipments",
      value: "412 Deliveries",
      change: "99.8% ingestion success rate",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "text-amber-500",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      trend: "up"
    }
  ];

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Top Section: Welcome Banner & Insights Slider */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Welcome Banner - Glassmorphism & Gradient */}
        <div className="lg:col-span-3 relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-8 sm:p-10 text-white shadow-2xl overflow-hidden flex flex-col justify-between min-h-[260px] group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          
          {/* Animated Glow Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-400/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-5 max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md flex items-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                System Online
              </span>
            </motion.div>
            <div className="space-y-2">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
              >
                Welcome back, {user?.name || 'Commander'}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-sm sm:text-base leading-relaxed font-medium max-w-md"
              >
                Your command center is ready. Secure connection established and distribution nodes are synchronized.
              </motion.p>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 pt-5 flex flex-wrap gap-8 text-sm text-white/80 font-semibold border-t border-white/10 mt-6"
          >
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Access Level</p>
              <p className="text-white font-bold tracking-wide flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {user?.role || 'Administrator'}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Network Status</p>
              <p className="text-white font-bold tracking-wide flex items-center gap-1.5">
                <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Optimal
              </p>
            </div>
          </motion.div>
        </div>

        {/* Insights/News Slider - Glassmorphism */}
        <div className="lg:col-span-2 bg-card/60 backdrop-blur-xl border border-card-border/50 rounded-3xl p-8 shadow-xl flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
          
          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] font-black text-foreground uppercase tracking-widest">
                  Intelligence Feed
                </span>
              </div>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            </div>

            <div className="relative h-[110px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col gap-3"
                >
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r border ${insights[activeSlide].color}`}>
                      {insights[activeSlide].badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-foreground leading-tight tracking-tight">
                    {insights[activeSlide].title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {insights[activeSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2 pt-4 relative z-10">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === index ? 'w-8 bg-primary shadow-[0_0_8px_var(--color-primary)]' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card/80 backdrop-blur-md border border-card-border/60 rounded-3xl p-6 shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Subtle glow effect behind icon */}
            <div className={`absolute top-0 right-0 p-16 ${stat.bgClass.split(' ')[0]} rounded-full blur-2xl -mr-8 -mt-8 opacity-50 pointer-events-none transition-transform duration-500 group-hover:scale-150`} />

            <div className="relative z-10 flex items-start justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${stat.bgClass} ${stat.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                {stat.icon}
              </div>
              {stat.trend === 'up' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  Trending
                </span>
              )}
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                {stat.label}
              </span>
              <h4 className="text-3xl font-black text-foreground tracking-tight">
                {stat.value}
              </h4>
              <span className="text-[11px] font-semibold text-muted-foreground block mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Added Visual Chart Area mock */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-card/60 backdrop-blur-xl border border-card-border/50 rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-foreground">Global Streaming Activity</h3>
            <p className="text-sm text-muted-foreground">Volume across integrated DSPs over the last 7 days</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg">
            <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold shadow-sm">7D</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-xs font-bold transition-colors">30D</button>
            <button className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground text-xs font-bold transition-colors">YTD</button>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="h-48 w-full flex items-end gap-2 sm:gap-4 justify-between mt-4 relative">
          {/* Chart Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            {[1,2,3,4].map(i => <div key={i} className="w-full border-t border-foreground border-dashed"></div>)}
          </div>
          
          {/* Bars */}
          {[40, 60, 35, 80, 55, 90, 75].map((height, i) => (
            <div key={i} className="relative flex flex-col items-center flex-1 group">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-lg z-20 pointer-events-none">
                {height * 12}K Plays
              </div>
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                className="w-full max-w-[48px] bg-gradient-to-t from-primary/40 to-primary rounded-t-lg shadow-[0_0_15px_rgba(var(--color-primary),0.3)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
              <span className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-wider">Day {i+1}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
