import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchArtists, createArtist, deleteArtist, updateArtist } from '../api/api';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

// Form validation schema aligned with swagger.json schema properties for CreateArtistCommand / UpdateArtistRequest
const ArtistSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short!')
    .max(50, 'Name is too long!')
    .required('Artist name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Contact email is required'),
  country: Yup.string()
    .min(2, 'Country name is too short!')
    .max(50, 'Country name is too long!')
    .required('Country of origin is required'),
});

export default function ArtistsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  
  // Modals & local state
  const [editingArtist, setEditingArtist] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingArtist, setDeletingArtist] = useState(null);
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  // Fetch Artists from API (GET /api/artists)
  const { data: apiArtists = [], isLoading, refetch } = useQuery({
    queryKey: ['artists'],
    queryFn: fetchArtists,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Create mutation
  const createMutation = useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setIsCreateOpen(false);
      showToast('Artist registered successfully in secure database.');
    },
    onError: (err) => {
      console.error('API Post failed:', err);
      showToast(err.message || 'Failed to register artist.', 'danger');
    },
  });

  // 2. Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedArtist) => {
      const { id, ...data } = updatedArtist;
      return await updateArtist(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setEditingArtist(null);
      showToast('Artist details updated successfully.');
    },
    onError: (err) => {
      console.error('API Put failed:', err);
      showToast(err.message || 'Failed to update artist details.', 'danger');
    },
  });

  // 3. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setDeletingArtist(null);
      showToast('Artist deleted successfully from database.');
    },
    onError: (err) => {
      console.error('API Delete failed:', err);
      showToast(err.message || 'Failed to delete artist from database.', 'danger');
    },
  });

  // Data consolidation (Strictly using backend API data only)
  const allArtists = Array.isArray(apiArtists) ? apiArtists : [];

  // Get unique countries for filter dropdown
  const uniqueCountries = ['All', ...new Set(allArtists.map(a => a.country || a.Country).filter(Boolean))];

  // Filtering and sorting operations
  const filteredArtists = allArtists
    .filter((artist) => {
      const name = artist.name || artist.Name || '';
      const email = artist.email || artist.Email || '';
      const country = artist.country || artist.Country || '';
      
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = countryFilter === 'All' || country === countryFilter;
      
      return matchesSearch && matchesCountry;
    })
    .sort((a, b) => {
      const nameA = (a.name || a.Name || '').toLowerCase();
      const nameB = (b.name || b.Name || '').toLowerCase();
      const countryA = (a.country || a.Country || '').toLowerCase();
      const countryB = (b.country || b.Country || '').toLowerCase();
      
      if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
      if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
      if (sortBy === 'country-asc') return countryA.localeCompare(countryB);
      return 0;
    });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification with Progress Bar */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex flex-col gap-2 text-xs font-bold border backdrop-blur-xl min-w-[280px] overflow-hidden ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 dark:bg-emerald-400/5'
                : toast.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-500 dark:bg-amber-400/5'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-500 dark:bg-rose-400/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-current shrink-0" />
              <span>{toast.message}</span>
            </div>
            
            {/* Visual depletion bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className={`h-0.5 mt-1 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header / Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Artists Registry</h3>
          <p className="text-xs text-muted-foreground mt-1">Manage artists profiles, contact records, and origin countries securely.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Refresh database catalog"
          >
            {isLoading ? <Spinner size="sm" /> : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
              </svg>
            )}
            Refresh
          </button>

          <button
            onClick={() => {
              setGlobalError(null);
              setServerErrors({});
              setIsCreateOpen(true);
            }}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register Artist
          </button>
        </div>
      </div>

      {/* Filtering & Sorting Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-card border border-card-border shadow-sm">
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Country Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Origin</label>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          >
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="country-asc">Country (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Artists Catalog List Area */}
      {isLoading ? (
        <Skeleton variant="list" count={3} />
      ) : filteredArtists.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-card-border rounded-2xl bg-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">No Artists Found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              There are no artists matching your filters or register catalog. Click 'Register Artist' to start.
            </p>
          </div>
          {(searchQuery || countryFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCountryFilter('All');
              }}
              className="bg-primary text-primary-foreground font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredArtists.map((artist) => {
            const id = artist.id || artist.Id || '';
            const name = artist.name || artist.Name || 'Unknown Artist';
            const email = artist.email || artist.Email || 'No contact email';
            const country = artist.country || artist.Country || 'Unknown Country';
            
            return (
              <motion.div
                layout
                key={id}
                className="flex items-center justify-between p-4 rounded-xl border border-card-border bg-card hover:border-primary/45 hover:shadow-[0_4px_20px_rgba(124,58,237,0.03)] dark:hover:shadow-[0_4px_20px_rgba(168,85,247,0.03)] transition-all duration-300 relative group pl-5 hover:pl-6 border-l-2 hover:border-l-primary"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/15 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 transition-all duration-350 group-hover:scale-105">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground transition-colors duration-200 group-hover:text-primary">{name}</h4>
                    <span className="text-xs text-muted-foreground">{email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold">{country}</p>
                    <span className="text-[10px] text-muted-foreground">Country of Origin</span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pl-3 border-l border-card-border/80">
                    <button
                      onClick={() => {
                        setGlobalError(null);
                        setServerErrors({});
                        setEditingArtist(artist);
                      }}
                      className="p-2 rounded-lg border border-card-border hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                      title="Edit details"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingArtist(artist)}
                      className="p-2 rounded-lg border border-card-border hover:bg-danger/10 hover:text-danger text-muted-foreground transition-all duration-200 cursor-pointer"
                      title="Delete record"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODALS */}
      <AnimatePresence>
        {(isCreateOpen || editingArtist) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCreateOpen(false);
                setEditingArtist(null);
              }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 space-y-5"
            >
              <div>
                <h4 className="text-lg font-bold">
                  {editingArtist ? 'Edit Artist Profile' : 'Register New Artist'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Provide secure profile fields to publish to distribution nodes.
                </p>
              </div>

              <Formik
                initialValues={{
                  name: editingArtist ? (editingArtist.name || editingArtist.Name || '') : '',
                  email: editingArtist ? (editingArtist.email || editingArtist.Email || '') : '',
                  country: editingArtist ? (editingArtist.country || editingArtist.Country || '') : '',
                }}
                validationSchema={ArtistSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  setGlobalError(null);
                  setServerErrors({});
                  try {
                    if (editingArtist) {
                      await updateMutation.mutateAsync({
                        id: editingArtist.id || editingArtist.Id,
                        ...values,
                      });
                    } else {
                      await createMutation.mutateAsync(values);
                    }
                  } catch (e) {
                    console.error('Artist form submission failed:', e);
                    
                    if (e.message) {
                      setGlobalError(e.message);
                    }

                    if (e.errors) {
                      const formErrors = {};
                      for (const [key, val] of Object.entries(e.errors)) {
                        const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                        formErrors[fieldName] = Array.isArray(val) ? val[0] : val;
                      }
                      setServerErrors(formErrors);
                    } else if (!e.message && e instanceof Error) {
                      showToast('An error occurred during submission.', 'danger');
                    }
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched, isSubmitting, values }) => (
                  <Form className="space-y-4">
                    
                    {globalError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-start gap-2">
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{globalError}</span>
                      </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Artist / Group Name</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within/field:text-primary transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <Field
                          type="text"
                          name="name"
                          placeholder="e.g. Fairuz"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.name && touched.name) || serverErrors.name
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {((errors.name && touched.name) || serverErrors.name) ? (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : touched.name && values.name ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                      <AnimatePresence>
                        {((errors.name && touched.name) || serverErrors.name) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, -4, 4, 0] }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {serverErrors.name || errors.name}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Contact Email</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within/field:text-primary transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <Field
                          type="email"
                          name="email"
                          placeholder="e.g. artist@takwene.com"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.email && touched.email) || serverErrors.email
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {((errors.email && touched.email) || serverErrors.email) ? (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : touched.email && values.email ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                      <AnimatePresence>
                        {((errors.email && touched.email) || serverErrors.email) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, -4, 4, 0] }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {serverErrors.email || errors.email}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Country Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Country of Origin</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within/field:text-primary transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V8a2 2 0 00-2-2h-.5A2 2 0 0115 4V3.055" />
                          </svg>
                        </div>
                        <Field
                          type="text"
                          name="country"
                          placeholder="e.g. Lebanon"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.country && touched.country) || serverErrors.country
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {((errors.country && touched.country) || serverErrors.country) ? (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : touched.country && values.country ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                      <AnimatePresence>
                        {((errors.country && touched.country) || serverErrors.country) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, -4, 4, 0] }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {serverErrors.country || errors.country}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex items-center gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreateOpen(false);
                          setEditingArtist(null);
                        }}
                        className="flex-1 border border-card-border hover:bg-muted text-foreground font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                        className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer flex justify-center items-center gap-1.5"
                      >
                        {(isSubmitting || createMutation.isPending || updateMutation.isPending) && (
                          <Spinner size="sm" light />
                        )}
                        {editingArtist ? 'Save Changes' : 'Confirm Registration'}
                      </button>
                    </div>

                  </Form>
                )}
              </Formik>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingArtist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingArtist(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-foreground">Confirm Artist Deletion</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <strong>{deletingArtist.name || deletingArtist.Name}</strong>? This action will unlink associated catalog metadata.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingArtist(null)}
                  className="flex-1 border border-card-border hover:bg-muted text-foreground font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deletingArtist.id || deletingArtist.Id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-danger hover:bg-danger/90 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {deleteMutation.isPending && <Spinner size="sm" light />}
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
