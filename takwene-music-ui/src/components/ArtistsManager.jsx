import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

const MOCK_ARTISTS = [
  { id: '1', name: 'Fairuz', genre: 'Classical Arabic', status: 'Active', tracksCount: 150 },
  { id: '2', name: 'Amr Diab', genre: 'Arabic Pop', status: 'Active', tracksCount: 82 },
  { id: '3', name: 'Marcel Khalife', genre: 'Oud & Folk', status: 'Active', tracksCount: 45 },
];

const ArtistSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short!')
    .max(50, 'Name is too long!')
    .required('Artist name is required'),
  genre: Yup.string()
    .min(2, 'Genre is too short!')
    .max(30, 'Genre is too long!')
    .required('Music genre is required'),
  status: Yup.string()
    .oneOf(['Active', 'Inactive'], 'Invalid status')
    .required('Status selection is required'),
});

export default function ArtistsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  
  // Modals & local state
  const [editingArtist, setEditingArtist] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingArtist, setDeletingArtist] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Custom mock persistence
  const [mockArtistsOverride, setMockArtistsOverride] = useState(MOCK_ARTISTS);
  const [localArtists, setLocalArtists] = useState([]);

  // Fetch Artists from API
  const { data: apiArtists = [], isLoading, refetch } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const res = await axiosClient.get('api/artists');
      return Array.isArray(res) ? res : (res?.data || []);
    },
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Create mutation
  const createMutation = useMutation({
    mutationFn: async (newArtist) => {
      return await axiosClient.post('api/artists', newArtist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setIsCreateOpen(false);
      showToast('Artist registered successfully in secure database.');
    },
    onError: (err, newArtist) => {
      console.warn('API Post failed, falling back to local state:', err);
      const mockNew = {
        id: Math.random().toString(),
        name: newArtist.name,
        genre: newArtist.genre,
        status: newArtist.status,
        tracksCount: 0,
      };
      setLocalArtists((prev) => [mockNew, ...prev]);
      setIsCreateOpen(false);
      showToast('Artist added to local workspace (API unreachable).', 'warning');
    },
  });

  // 2. Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedArtist) => {
      return await axiosClient.put(`api/artists/${updatedArtist.id}`, updatedArtist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setEditingArtist(null);
      showToast('Artist details updated successfully.');
    },
    onError: (err, updatedArtist) => {
      console.warn('API Put failed, falling back to local state:', err);
      setLocalArtists((prev) =>
        prev.map((a) => (a.id === updatedArtist.id ? { ...a, ...updatedArtist } : a))
      );
      setMockArtistsOverride((prev) =>
        prev.map((a) => (a.id === updatedArtist.id ? { ...a, ...updatedArtist } : a))
      );
      setEditingArtist(null);
      showToast('Artist updated in local workspace.', 'warning');
    },
  });

  // 3. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axiosClient.delete(`api/artists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      setDeletingArtist(null);
      showToast('Artist deleted successfully from database.');
    },
    onError: (err, id) => {
      console.warn('API Delete failed, falling back to local state:', err);
      setLocalArtists((prev) => prev.filter((a) => a.id !== id));
      setMockArtistsOverride((prev) => prev.filter((a) => a.id !== id));
      setDeletingArtist(null);
      showToast('Artist removed from local workspace.', 'warning');
    },
  });

  // Data consolidation
  const resolvedApiArtists = Array.isArray(apiArtists) ? apiArtists : [];
  const baseArtists = resolvedApiArtists.length > 0 ? resolvedApiArtists : mockArtistsOverride;
  const allArtists = [...localArtists, ...baseArtists];

  // Filtering and sorting operations
  const filteredArtists = allArtists
    .filter((artist) => {
      const name = artist.name || artist.Name || '';
      const genre = artist.genre || artist.Genre || '';
      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        genre.toLowerCase().includes(searchQuery.toLowerCase());
      
      const status = artist.status || artist.Status || 'Active';
      const matchesStatus = statusFilter === 'All' || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = (a.name || a.Name || '').toLowerCase();
      const nameB = (b.name || b.Name || '').toLowerCase();
      const tracksA = a.tracksCount !== undefined ? a.tracksCount : (a.TracksCount !== undefined ? a.TracksCount : 0);
      const tracksB = b.tracksCount !== undefined ? b.tracksCount : (b.TracksCount !== undefined ? b.TracksCount : 0);
      
      if (sortBy === 'name-asc') return nameA.localeCompare(nameB);
      if (sortBy === 'name-desc') return nameB.localeCompare(nameA);
      if (sortBy === 'tracks-desc') return tracksB - tracksA;
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
          <p className="text-xs text-muted-foreground mt-1">Manage artists profiles, catalog counts, and digital publication states.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            Refresh List
          </button>
          
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Artist
          </button>
        </div>
      </div>

      {/* Filter / Sort Control Dashboard */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card/45 border border-card-border p-4 rounded-2xl">
        
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by artist or genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/30 border border-card-border text-foreground text-sm font-semibold pl-11 pr-4 py-2.5 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
            <div className="flex bg-muted/60 p-0.5 rounded-xl border border-card-border">
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${
                    statusFilter === status
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-card-border text-foreground text-xs font-bold py-2 px-3.5 rounded-xl outline-none transition-colors duration-200 focus:border-primary cursor-pointer"
            >
              <option value="name-asc">Alphabetical (A - Z)</option>
              <option value="name-desc">Alphabetical (Z - A)</option>
              <option value="tracks-desc">Catalog size (High - Low)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid List View */}
      {isLoading ? (
        <Skeleton variant="list" count={3} />
      ) : filteredArtists.length === 0 ? (
        <div className="border border-card-border bg-card/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm">No artists match your criteria</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Try adjusting your search queries or filtering states to find your profiles.
            </p>
          </div>
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
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
            const genre = artist.genre || artist.Genre || 'Unknown Genre';
            const status = artist.status || artist.Status || 'Active';
            const tracksCount = artist.tracksCount !== undefined ? artist.tracksCount : (artist.TracksCount !== undefined ? artist.TracksCount : (artist.tracks?.length || artist.Tracks?.length || 0));
            
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
                    <span className="text-xs text-muted-foreground">{genre}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold">{tracksCount} Tracks</p>
                    <span className="text-[10px] text-muted-foreground">Catalog size</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    status === 'Active' ? 'bg-success/15 text-success' : 'bg-muted-foreground/15 text-muted-foreground'
                  }`}>
                    {status}
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 pl-3 border-l border-card-border/80">
                    <button
                      onClick={() => setEditingArtist(artist)}
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
                  genre: editingArtist ? (editingArtist.genre || editingArtist.Genre || '') : '',
                  status: editingArtist ? (editingArtist.status || editingArtist.Status || 'Active') : 'Active',
                }}
                validationSchema={ArtistSchema}
                onSubmit={async (values, { setSubmitting }) => {
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
                    console.error(e);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ errors, touched, isSubmitting, values }) => (
                  <Form className="space-y-4">
                    
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
                            errors.name && touched.name
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]'
                          }`}
                        />
                        {/* Valid/Invalid Status Icon indicator */}
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {errors.name && touched.name ? (
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
                        {errors.name && touched.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, -4, 4, 0] }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {errors.name}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Genre Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Musical Genre</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within/field:text-primary transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <Field
                          type="text"
                          name="genre"
                          placeholder="e.g. Classical Arabic, Oud"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 ${
                            errors.genre && touched.genre
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15 focus:shadow-[0_0_22px_rgba(var(--color-primary),0.35)]'
                          }`}
                        />
                        {/* Valid/Invalid Status Icon indicator */}
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                          {errors.genre && touched.genre ? (
                            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : touched.genre && values.genre ? (
                            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : null}
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors.genre && touched.genre && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto', x: [0, -4, 4, -4, 4, 0] }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {errors.genre}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Status selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">System Status</label>
                      <Field
                        as="select"
                        name="status"
                        className="w-full bg-muted/40 border border-card-border text-foreground text-sm font-semibold pl-4 pr-4 py-3 rounded-xl outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/15"
                      >
                        <option value="Active">Active (Publishable)</option>
                        <option value="Inactive">Inactive (Suspended)</option>
                      </Field>
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
