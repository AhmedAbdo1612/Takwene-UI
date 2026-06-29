import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchTracks, createTrack, updateTrack, deleteTrack, fetchArtists } from '../api/api';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

// Form validation schema aligned with swagger.json for CreateTrackCommand / UpdateTrack
const TrackSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title is too short!')
    .max(100, 'Title is too long!')
    .required('Track title is required'),
  artistId: Yup.string()
    // .uuid('Invalid artist selection')
    .length(36,"Invalid artist selection")
    .required('Selecting an artist is required'),
  isrc: Yup.string()
    // .matches(/^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/i, 'Must be a valid 12-character ISRC code (e.g. USPR32000001)')
    .required('ISRC code is required'),
  releaseDate: Yup.date()
    .required('Release date is required'),
  genre: Yup.string()
    .min(2, 'Genre is too short!')
    .max(50, 'Genre is too long!')
    .required('Music genre is required'),
  status: Yup.number()
    .oneOf([0, 1, 2], 'Invalid status selection')
    .required('Track status is required'),
});

// Map backend TrackStatus integer to readable label/badge styling
const STATUS_MAP = {
  0: { label: 'Draft', style: 'bg-muted-foreground/15 text-muted-foreground' },
  1: { label: 'Submitted', style: 'bg-warning/15 text-warning' },
  2: { label: 'Distributed', style: 'bg-success/15 text-success' }
};

export default function TracksManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [artistFilter, setArtistFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [deletingTrack, setDeletingTrack] = useState(null);
  const [toast, setToast] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);

  // Fetch Tracks from API (GET /api/tracks)
  const { data: apiTracks = [], isLoading: isTracksLoading, refetch: refetchTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => fetchTracks(),
  });

  // Fetch Artists from API (GET /api/artists) to map names and fill form dropdown
  const { data: apiArtists = [], isLoading: isArtistsLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: fetchArtists,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create track mutation
  const createMutation = useMutation({
    mutationFn: createTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setIsModalOpen(false);
      setSearchQuery('');
      setArtistFilter('All');
      setStatusFilter('All');
      showToast('Track successfully registered in digital catalog.');
    },
    onError: (err) => {
      console.error('API Track Create failed:', err);
      showToast(err.message || 'Failed to create track.', 'danger');
    },
  });

  // Update track mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTrack(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setIsModalOpen(false);
      setEditingTrack(null);
      setSearchQuery('');
      setArtistFilter('All');
      setStatusFilter('All');
      showToast('Track metadata successfully updated.');
    },
    onError: (err) => {
      console.error('API Track Update failed:', err);
      showToast(err.message || 'Failed to update track details.', 'danger');
    },
  });

  // Delete track mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      setDeletingTrack(null);
      setSearchQuery('');
      setArtistFilter('All');
      setStatusFilter('All');
      showToast('Track permanently removed from catalog.', 'success');
    },
    onError: (err) => {
      console.error('API Track Delete failed:', err);
      showToast(err.message || 'Failed to delete track. It may be linked to active distributions.', 'danger');
      setDeletingTrack(null);
    },
  });

  // Map artist GUIDs to names for quick resolution in the list
  const artistMap = useMemo(() => {
    const map = {};
    if (Array.isArray(apiArtists)) {
      apiArtists.forEach((artist) => {
        map[artist.id || artist.Id] = artist.name || artist.Name;
      });
    }
    return map;
  }, [apiArtists]);

  // Extract unique genres for filtering
  const uniqueGenres = useMemo(() => {
    if (!Array.isArray(apiTracks)) return [];
    return [...new Set(apiTracks.map((t) => t.genre || t.Genre).filter(Boolean))];
  }, [apiTracks]);

  // Filtering operations
  const filteredTracks = useMemo(() => {
    if (!Array.isArray(apiTracks)) return [];
    return apiTracks.filter((track) => {
      const title = track.title || track.Title || '';
      const isrc = track.isrc || track.Isrc || '';
      const genre = track.genre || track.Genre || '';
      const artistId = track.artistId || track.ArtistId || '';
      const status = track.status !== undefined ? track.status : (track.Status !== undefined ? track.Status : 0);

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        isrc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        genre.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesArtist = artistFilter === 'All' || artistId === artistFilter;
      const matchesStatus = statusFilter === 'All' || status.toString() === statusFilter;

      return matchesSearch && matchesArtist && matchesStatus;
    });
  }, [apiTracks, searchQuery, artistFilter, statusFilter]);

  const isLoading = isTracksLoading || isArtistsLoading;

  const handleEditClick = (track) => {
    setEditingTrack(track);
    setServerErrors({});
    setGlobalError(null);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTrack(null);
    setServerErrors({});
    setGlobalError(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex flex-col gap-2 text-xs font-bold border backdrop-blur-xl min-w-[280px] overflow-hidden ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 dark:bg-emerald-400/5'
                : 'bg-rose-500/10 border-rose-500/25 text-rose-500 dark:bg-rose-400/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-current shrink-0" />
              <span>{toast.message}</span>
            </div>
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className={`h-0.5 mt-1 rounded-full ${
                toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Track Catalog</h3>
          <p className="text-xs text-muted-foreground mt-1">Manage audio release assets, standard ISRC mappings, and publication states.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchTracks()}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isTracksLoading ? <Spinner size="sm" /> : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
              </svg>
            )}
            Refresh
          </button>

          <button
            onClick={handleCreateClick}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Track
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-card border border-card-border shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title, ISRC, genre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Artist Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Artist</label>
          <select
            value={artistFilter}
            onChange={(e) => setArtistFilter(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          >
            <option value="All">All Artists</option>
            {apiArtists.map((a) => (
              <option key={a.id || a.Id} value={a.id || a.Id}>{a.name || a.Name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          >
            <option value="All">All Statuses</option>
            <option value="0">Draft</option>
            <option value="1">Submitted</option>
            <option value="2">Distributed</option>
          </select>
        </div>

      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-card-border rounded-2xl bg-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">No Tracks Found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              There are no tracks in your catalog matching the selection criteria. Click 'Add Track' to begin.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredTracks.map((track) => {
            const id = track.id || track.Id || Math.random().toString();
            const title = track.title || track.Title || 'Untitled';
            const artistId = track.artistId || track.ArtistId || '';
            const artistName = artistMap[artistId] || 'Unknown Artist';
            const isrc = track.isrc || track.Isrc || 'N/A';
            const genre = track.genre || track.Genre || 'Unknown';
            const statusVal = track.status !== undefined ? track.status : (track.Status !== undefined ? track.Status : 0);
            const statusConfig = STATUS_MAP[statusVal] || { label: 'Draft', style: 'bg-muted-foreground/15 text-muted-foreground' };
            const releaseDate = track.releaseDate || track.ReleaseDate || '';
            const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
            
            // Random Unsplash image determined by track ID for visually premium aesthetic
            const seed = id.charCodeAt(0) || 101;
            const coverUrl = `https://images.unsplash.com/photo-${seed % 3 === 0 ? '1514525253161-7a46d19cd819' : seed % 2 === 0 ? '1470225620780-dba8ba36b745' : '1511671782779-c97d3d27a1d4'}?w=400&q=80`;

            return (
              <motion.div
                layout
                key={id}
                className="border border-card-border bg-card rounded-xl p-5 space-y-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group"
              >
                <div className="space-y-4">
                  {/* Visual Art */}
                  <div className="w-full aspect-video rounded-lg overflow-hidden relative group shrink-0">
                    <img
                      src={coverUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2.5 right-2.5 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                      {genre}
                    </span>

                    {/* Options overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleEditClick(track)}
                        className="p-2.5 rounded-full bg-white text-slate-800 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-md transform translate-y-2 group-hover:translate-y-0 duration-200"
                        title="Edit Track"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingTrack(track)}
                        className="p-2.5 rounded-full bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-md transform translate-y-2 group-hover:translate-y-0 duration-200 delay-75"
                        title="Delete Track"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm leading-tight text-foreground">{title}</h4>
                    <p className="text-xs text-primary font-bold">{artistName}</p>
                    <div className="pt-2 text-[10px] space-y-1 text-muted-foreground font-semibold">
                      <p>ISRC: <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">{isrc}</code></p>
                      <p>Released: {formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-card-border/60 mt-2">
                  <span className="text-[10px] text-muted-foreground font-semibold">Catalog Resource</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.style}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 space-y-5"
            >
              <div>
                <h4 className="text-lg font-bold">{editingTrack ? 'Edit Track' : 'Register New Track'}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Link secure metadata structures to publish to worldwide DSP delivery pipelines.
                </p>
              </div>

              {apiArtists.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold leading-relaxed space-y-3">
                  <p><strong>Warning:</strong> You cannot add tracks without registered artists in the database registry.</p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg text-center cursor-pointer shadow-sm"
                  >
                    Go to Artists Registry
                  </button>
                </div>
              ) : (
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    title: editingTrack ? (editingTrack.title || editingTrack.Title || '') : '',
                    artistId: editingTrack ? (editingTrack.artistId || editingTrack.ArtistId || '') : (apiArtists[0]?.id || apiArtists[0]?.Id || ''),
                    isrc: editingTrack ? (editingTrack.isrc || editingTrack.Isrc || '') : '',
                    releaseDate: editingTrack ? (editingTrack.releaseDate || editingTrack.ReleaseDate || '').split('T')[0] : '',
                    genre: editingTrack ? (editingTrack.genre || editingTrack.Genre || '') : '',
                    status: editingTrack ? (editingTrack.status !== undefined ? editingTrack.status : (editingTrack.Status || 0)) : 0,
                  }}
                  validationSchema={TrackSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setServerErrors({});
                    setGlobalError(null);
                    try {
                      const rawDate = new Date(values.releaseDate);
                      if (isNaN(rawDate.getTime())) {
                        throw new RangeError('Invalid release date format.');
                      }

                      const payload = {
                        ...values,
                        isrc: values.isrc.toUpperCase(),
                        status: Number(values.status),
                        releaseDate: rawDate.toISOString()
                      };

                      if (editingTrack) {
                        const trackId = editingTrack.id || editingTrack.Id;
                        await updateMutation.mutateAsync({ id: trackId, data: payload });
                      } else {
                        await createMutation.mutateAsync(payload);
                      }
                    } catch (e) {
                      console.error('Track form submission failed:', e);
                      
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
                  {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-4">
                      
                      {globalError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-start gap-2">
                          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{globalError}</span>
                        </div>
                      )}

                      {/* Title */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Track Title</label>
                        <Field
                          type="text"
                          name="title"
                          placeholder="e.g. Tamally Maak"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.title && touched.title) || serverErrors.title ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                        {((errors.title && touched.title) || serverErrors.title) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.title || errors.title}</div>
                        )}
                      </div>

                      {/* Artist Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Artist Registry Owner</label>
                        <Field
                          as="select"
                          name="artistId"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.artistId && touched.artistId) || serverErrors.artistId ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        >
                          {apiArtists.map((a) => (
                            <option key={a.id || a.Id} value={a.id || a.Id}>{a.name || a.Name}</option>
                          ))}
                        </Field>
                        {((errors.artistId && touched.artistId) || serverErrors.artistId) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.artistId || errors.artistId}</div>
                        )}
                      </div>

                      {/* ISRC Code */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">ISRC Code</label>
                        <Field
                          type="text"
                          name="isrc"
                          placeholder="e.g. USPR32000001"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.isrc && touched.isrc) || serverErrors.isrc ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                        {((errors.isrc && touched.isrc) || serverErrors.isrc) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.isrc || errors.isrc}</div>
                        )}
                      </div>

                      {/* Release Date */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Release Date</label>
                        <Field
                          type="date"
                          name="releaseDate"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.releaseDate && touched.releaseDate) || serverErrors.releaseDate ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                        {((errors.releaseDate && touched.releaseDate) || serverErrors.releaseDate) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.releaseDate || errors.releaseDate}</div>
                        )}
                      </div>

                      {/* Genre */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Musical Genre</label>
                        <Field
                          type="text"
                          name="genre"
                          placeholder="e.g. Arabic Pop, Oud"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.genre && touched.genre) || serverErrors.genre ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                        {((errors.genre && touched.genre) || serverErrors.genre) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.genre || errors.genre}</div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Initial Publication Status</label>
                        <Field
                          as="select"
                          name="status"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.status && touched.status) || serverErrors.status ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        >
                          <option value={0}>Draft (Not published)</option>
                          <option value={1}>Submitted (Awaiting ingest)</option>
                          <option value={2}>Distributed (Live on DSPs)</option>
                        </Field>
                        {((errors.status && touched.status) || serverErrors.status) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.status || errors.status}</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
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
                          {editingTrack ? 'Save Changes' : 'Confirm Track'}
                        </button>
                      </div>

                    </Form>
                  )}
                </Formik>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingTrack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingTrack(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold">Delete Track?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete <strong>{deletingTrack.title || deletingTrack.Title}</strong>? This action cannot be undone and will detach the catalog mapping.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingTrack(null)}
                  className="flex-1 border border-card-border hover:bg-muted text-foreground font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deletingTrack.id || deletingTrack.Id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {deleteMutation.isPending && <Spinner size="sm" light />}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
