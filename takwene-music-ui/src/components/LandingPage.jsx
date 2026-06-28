import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleCtaClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col overflow-x-hidden relative">
      
      {/* Decorative glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0" />

      {/* Nav Header */}
      <header className="w-full h-20 bg-card/75 backdrop-blur-md border-b border-card-border px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight">Takwene Music</h1>
            <span className="text-[10px] text-primary font-bold tracking-wider uppercase">Distribution Hub</span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200">Features</a>
          <a href="#dsps" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200">Supported DSPs</a>
          <a href="#analytics" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200">Analytics</a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-card-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Action button */}
          <button
            onClick={handleCtaClick}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 px-5 rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-200 cursor-pointer"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Enter Console'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Hero Left */}
        <motion.div 
          className="lg:col-span-7 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            V2.0 Console Now Live
          </motion.div>

          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-[1.1]"
          >
            Global Music <br />
            <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Distribution
            </span>, Simplified.
          </motion.h2>

          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed font-medium"
          >
            Deliver your tracks to Spotify, Apple Music, Deezer, TikTok, and over 150+ digital stores globally. Retain 100% ownership and watch your analytics grow in real-time.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleCtaClick}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-primary-foreground font-bold text-sm py-3 px-8 rounded-xl shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              {isAuthenticated ? 'Enter Console' : 'Register Free Account'}
            </button>
            <a
              href="#features"
              className="border border-card-border hover:bg-muted text-foreground font-bold text-sm py-3 px-8 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Explore Features
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </motion.div>

          {/* Quick stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-card-border/60 max-w-md"
          >
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground">150+</p>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">DSPs Supported</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground">2M+</p>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Tracks Streamed</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-extrabold text-foreground">100%</p>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Rights Retained</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Right: High-Fidelity Interactive Mockup */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15, delay: 0.3 }}
        >
          {/* Glassmorphic dashboard widget */}
          <div className="relative rounded-2xl bg-card border border-card-border shadow-2xl p-6 space-y-6 overflow-hidden">
            
            {/* Interactive elements visual */}
            <div className="flex items-center justify-between border-b border-card-border/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-danger" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded font-bold">
                console_v2.json
              </span>
            </div>

            {/* Simulated Live track pipeline */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-card-border/60">
                <div className="w-12 h-12 rounded bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Tamally Maak</p>
                  <p className="text-[10px] text-muted-foreground">Amr Diab • 4:12</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-warning/15 text-warning font-bold text-[9px]">
                  Pending
                </span>
              </div>

              {/* Progress track */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground">Syncing to Spotify & Apple Music</span>
                  <span className="text-primary">85% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[85%] rounded-full" />
                </div>
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-muted/30 border border-card-border rounded-lg text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Deliveries</p>
                <p className="text-lg font-bold text-success mt-0.5">Active</p>
              </div>
              <div className="p-3 bg-muted/30 border border-card-border rounded-lg text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">API Status</p>
                <p className="text-lg font-bold text-primary mt-0.5">Online</p>
              </div>
            </div>

            {/* Action simulation */}
            <button
              onClick={handleCtaClick}
              className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground font-bold text-xs py-3 px-4 rounded-xl border border-card-border/80 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Open Secure Console
            </button>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/40 border-y border-card-border transition-colors duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <h3 className="text-xs text-primary font-bold uppercase tracking-wider">Advanced Features</h3>
            <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything you need to distribute globally</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Takwene Music bridges the gap between your music catalog and global streaming giants with robust, enterprise-grade tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-card border border-card-border rounded-2xl p-8 space-y-4 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h5 className="font-bold text-lg">Direct DSP Pipelines</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Direct integration with Spotify, Apple Music, and Deezer ensures your music is ingested with zero latency and conforms to DDEX standards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border border-card-border rounded-2xl p-8 space-y-4 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h5 className="font-bold text-lg">Smart Analytics</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unlock granular analytics from DSP streams. Monitor performance, playlist placements, and geographical listener statistics all in one dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border border-card-border rounded-2xl p-8 space-y-4 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h5 className="font-bold text-lg">Identity Core Security</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Secured via ASP.NET Identity Core, token rotation mechanics, and strict validation rule-sets so your catalog's metadata is always safe.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* DSP Showcase */}
      <section id="dsps" className="py-24 max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <h4 className="text-3xl font-extrabold tracking-tight">Seamless Integration with Top DSPs</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get your tracks live on major platforms globally within days.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Spotify', desc: 'Direct XML delivery', color: 'text-[#1DB954]' },
            { name: 'Apple Music', desc: 'Lossless & Dolby Atmos support', color: 'text-[#FC3C44]' },
            { name: 'Deezer', desc: 'FLAC audio encoding', color: 'text-[#FF4A2A]' },
            { name: 'Amazon Music', desc: 'Ultra HD streaming sync', color: 'text-[#00A8E8]' }
          ].map((dsp, idx) => (
            <div key={idx} className="bg-card border border-card-border p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 hover:border-primary/20 hover:scale-105 transition-all duration-300">
              <span className={`text-xl font-bold ${dsp.color}`}>{dsp.name}</span>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">{dsp.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-card-border/80 bg-card/25 backdrop-blur-md px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground relative z-10 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className="font-bold text-foreground">Takwene Music Distribution</span>
        </div>
        <p>© {new Date().getFullYear()} Takwene Music. All rights reserved. Secure ASP.NET Gateway.</p>
      </footer>
    </div>
  );
}
