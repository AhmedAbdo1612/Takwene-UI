import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Spinner from './Spinner';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setUserName('');
    setConfirmPassword('');
    setErrorMsg('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSwitchMode = (mode) => {
    if (mode === isLogin) return;
    setIsLogin(mode);
    clearForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field checking
    if (!email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (!isLogin) {
      if (!userName) {
        setErrorMsg('Please enter a valid username.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      // Check for C# Identity Core validation rules on the frontend
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setErrorMsg('Password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!/[0-9]/.test(password)) {
        setErrorMsg('Password must contain at least one number (0-9).');
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setErrorMsg('Password must contain at least one special character.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(userName, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMsg(error.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    return {
      length: password.length >= 6,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  };

  const checks = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-300 relative overflow-hidden w-full select-none">
      
      {/* Absolute Blur Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Violet Blob */}
        <motion.div
          animate={{
            x: [0, 45, -25, 0],
            y: [0, -35, 45, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[120px]"
        />

        {/* Indigo Blob */}
        <motion.div
          animate={{
            x: [0, -45, 35, 0],
            y: [0, 55, -35, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary/20 dark:bg-secondary/10 blur-[130px]"
        />

        {/* Fuchsia Accent Blob in Center */}
        <motion.div
          animate={{
            scale: [0.85, 1.1, 0.85],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-[100px]"
        />
      </div>

      {/* Floating Theme Switcher Button */}
      <motion.button
        type="button"
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3.5 rounded-2xl bg-card/70 border border-card-border text-foreground hover:text-primary shadow-lg backdrop-blur-xl z-20 cursor-pointer transition-colors duration-200"
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle Theme"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="sun"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </motion.svg>
          ) : (
            <motion.svg
              key="moon"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Main Authentication Card */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-md bg-card/65 dark:bg-card/45 border border-card-border p-8 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(124,58,237,0.08)] dark:hover:shadow-[0_15px_50px_rgba(168,85,247,0.08)] backdrop-blur-xl relative z-10 transition-shadow duration-300"
      >
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.05 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg hover:shadow-primary/20 transition-all duration-300 mb-4 group/logo relative overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
            <svg className="w-8 h-8 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </motion.div>
          <motion.h2 
            layout="position"
            className="text-2xl font-extrabold tracking-tight text-foreground text-center"
          >
            Takwene Music Console
          </motion.h2>
          <motion.p
            layout="position"
            className="text-xs text-muted-foreground text-center mt-1.5 font-medium"
          >
            Secure Artist & Track Distribution Portal
          </motion.p>
        </div>

        {/* Sliding Pill Tab Switcher */}
        <div className="flex bg-muted/70 p-1.5 rounded-2xl mb-6 border border-card-border relative">
          <button
            type="button"
            onClick={() => handleSwitchMode(true)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl relative z-10 transition-colors duration-250 cursor-pointer ${
              isLogin ? 'text-primary-foreground font-extrabold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
            {isLogin && (
              <motion.div
                layoutId="activeAuthTab"
                className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          
          <button
            type="button"
            onClick={() => handleSwitchMode(false)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl relative z-10 transition-colors duration-250 cursor-pointer ${
              !isLogin ? 'text-primary-foreground font-extrabold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
            {!isLogin && (
              <motion.div
                layoutId="activeAuthTab"
                className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        </div>

        {/* Error Banners */}
        <AnimatePresence mode="sync">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="p-3.5 bg-danger/10 border border-danger/20 text-danger text-xs font-semibold rounded-2xl mb-5 flex items-start gap-2.5 shadow-sm"
            >
              <svg className="w-4.5 h-4.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Form Panel */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Name Field (Register Mode Only, Collapsible) */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto',
                  transition: {
                    height: { duration: 0.3, ease: 'easeOut' },
                    opacity: { duration: 0.25, delay: 0.05 }
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: {
                    height: { duration: 0.25, ease: 'easeIn' },
                    opacity: { duration: 0.15 }
                  }
                }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Fairuz Rahal"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-muted/40 border border-card-border text-foreground text-sm font-semibold pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2. Email Address Field */}
          <motion.div layout className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <input
                type="email"
                placeholder="e.g. name@takwenemusic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/40 border border-card-border text-foreground text-sm font-semibold pl-11 pr-4 py-3 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]"
                required
              />
            </div>
          </motion.div>

          {/* 3. Password Field */}
          <motion.div layout className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/40 border border-card-border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/75 hover:text-foreground transition-colors duration-150 cursor-pointer"
                tabIndex="-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Validation Checklist (Only in Register Mode) */}
            <AnimatePresence>
              {!isLogin && password && checks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-[11px] space-y-1.5 p-3 rounded-2xl bg-muted/30 border border-card-border mt-2"
                >
                  <p className="font-bold text-muted-foreground/80 pl-0.5">Password requirements:</p>
                  <div className="grid grid-cols-2 gap-2 font-semibold">
                    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${checks.length ? 'text-success' : 'text-muted-foreground/60'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${checks.length ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                      Min 6 chars
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${checks.upper ? 'text-success' : 'text-muted-foreground/60'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${checks.upper ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                      Uppercase (A-Z)
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${checks.number ? 'text-success' : 'text-muted-foreground/60'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${checks.number ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                      One number (0-9)
                    </div>
                    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${checks.special ? 'text-success' : 'text-muted-foreground/60'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${checks.special ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                      Special symbol
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 4. Confirm Password Field (Register Mode Only, Collapsible) */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ 
                  opacity: 1, 
                  height: 'auto',
                  transition: {
                    height: { duration: 0.3, ease: 'easeOut' },
                    opacity: { duration: 0.25, delay: 0.05 }
                  }
                }}
                exit={{ 
                  opacity: 0, 
                  height: 0,
                  transition: {
                    height: { duration: 0.25, ease: 'easeIn' },
                    opacity: { duration: 0.15 }
                  }
                }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-muted/40 border border-card-border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground/75 hover:text-foreground transition-colors duration-150 cursor-pointer"
                    tabIndex="-1"
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action Button */}
          <motion.div layout className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg hover:shadow-primary/20 dark:hover:shadow-primary/10 transition-all duration-200 flex justify-center items-center disabled:opacity-60 cursor-pointer relative overflow-hidden group/btn"
            >
              {/* Button Hover Glow Overlay */}
              <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Spinner size="sm" light />
                    <span>{isLogin ? 'Verifying Credentials...' : 'Creating Secure Profile...'}</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.15 }}
                  >
                    {isLogin ? 'Sign In to Console' : 'Initialize Account'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        {/* Alternate Navigation Footer Link */}
        <motion.div layout className="text-center mt-6">
          <button
            type="button"
            onClick={() => handleSwitchMode(!isLogin)}
            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            {isLogin ? (
              <span>New to Takwene Music? <strong className="text-primary hover:underline">Create an account</strong></span>
            ) : (
              <span>Already have an account? <strong className="text-primary hover:underline">Sign in</strong></span>
            )}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
