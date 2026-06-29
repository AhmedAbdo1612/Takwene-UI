import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchDistributions,
  createDistribution,
  updateDistribution,
  deleteDistribution,
  fetchTracks,
  fetchDsps
} from '../api/api';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

// Form validation schema aligned with swagger.json properties
const DistributionSchema = Yup.object().shape({
  trackId: Yup.string()
    // .uuid('Invalid track selection')
    .required('Selecting a track is required'),
  dspId: Yup.string()
    // .uuid('Invalid DSP selection')
    .required('Selecting a DSP is required'),
  submittedAt: Yup.string()
    .required('Submission timestamp is required'),
  status: Yup.number()
    .oneOf([0, 1, 2], 'Invalid status selection')
    .required('Status is required'),
});

const STATUS_MAP = {
  0: { label: 'Pending', style: 'bg-warning/15 text-warning border-warning/20' },
  1: { label: 'Live', style: 'bg-success/15 text-success border-success/20' },
  2: { label: 'Rejected', style: 'bg-danger/15 text-danger border-danger/20' }
};

export default function DistributionsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [dspFilter, setDspFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals & toast states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDist, setEditingDist] = useState(null);
  const [deletingDist, setDeletingDist] = useState(null);
  const [toast, setToast] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  // Fetch distributions, tracks, and DSPs from API
  const { data: apiDistributions = [], isLoading: isDistLoading, refetch: refetchDist } = useQuery({
    queryKey: ['distributions'],
    queryFn: fetchDistributions,
  });

  const { data: apiTracks = [], isLoading: isTracksLoading } = useQuery({
    queryKey: ['tracks'],
    queryFn: () => fetchTracks(),
  });

  const { data: apiDsps = [], isLoading: isDspsLoading } = useQuery({
    queryKey: ['dsps'],
    queryFn: fetchDsps,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      setIsModalOpen(false);
      showToast('Track distribution registered and queued for DSP delivery.');
    },
    onError: (err) => {
      console.error('API create failed:', err);
      showToast(err.message || 'Failed to trigger distribution.', 'danger');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return await updateDistribution(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      setEditingDist(null);
      setIsModalOpen(false);
      showToast('Distribution logs updated successfully.');
    },
    onError: (err) => {
      console.error('API update failed:', err);
      showToast(err.message || 'Failed to update distribution status.', 'danger');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDistribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      setDeletingDist(null);
      showToast('Distribution delivery log deleted from history.', 'success');
    },
    onError: (err) => {
      console.error('API delete failed:', err);
      showToast(err.message || 'Failed to delete distribution log.', 'danger');
    },
  });

  // Consolidate reference maps
  const trackMap = useMemo(() => {
    const map = {};
    if (Array.isArray(apiTracks)) {
      apiTracks.forEach((track) => {
        map[track.id || track.Id] = track.title || track.Title;
      });
    }
    return map;
  }, [apiTracks]);

  const dspMap = useMemo(() => {
    const map = {};
    if (Array.isArray(apiDsps)) {
      apiDsps.forEach((dsp) => {
        map[dsp.id || dsp.Id] = dsp.name || dsp.Name;
      });
    }
    return map;
  }, [apiDsps]);

  // Filtering and searching logic
  const filteredDistributions = useMemo(() => {
    if (!Array.isArray(apiDistributions)) return [];
    return apiDistributions.filter((dist) => {
      const trackId = dist.trackId || dist.TrackId || '';
      const dspId = dist.dspId || dist.DspId || '';
      const status = dist.status !== undefined ? dist.status : (dist.Status !== undefined ? dist.Status : 0);
      
      const trackTitle = trackMap[trackId] || 'Unknown Track';
      const dspName = dspMap[dspId] || 'Unknown DSP';

      const matchesSearch = trackTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDsp = dspFilter === 'All' || dspId === dspFilter;
      const matchesStatus = statusFilter === 'All' || status.toString() === statusFilter;

      return matchesSearch && matchesDsp && matchesStatus;
    });
  }, [apiDistributions, searchQuery, dspFilter, statusFilter, trackMap, dspMap]);

  const isLoading = isDistLoading || isTracksLoading || isDspsLoading;

  const handleCreateClick = () => {
    setEditingDist(null);
    setGlobalError(null);
    setServerErrors({});
    setIsModalOpen(true);
  };

  const handleEditClick = (dist) => {
    setEditingDist(dist);
    setGlobalError(null);
    setServerErrors({});
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast alert */}
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

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">DSP Deliveries</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage and audit distribution tasks of tracks to digital streaming providers securely.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchDist()}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {isDistLoading ? <Spinner size="sm" /> : (
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
            New Delivery
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-card border border-card-border shadow-sm">
        
        {/* Track Title Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by track title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          />
        </div>

        {/* DSP Filter */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide shrink-0">DSP</label>
          <select
            value={dspFilter}
            onChange={(e) => setDspFilter(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          >
            <option value="All">All DSPs</option>
            {apiDsps.map((d) => (
              <option key={d.id || d.Id} value={d.id || d.Id}>{d.name || d.Name}</option>
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
            <option value="0">Pending</option>
            <option value="1">Live</option>
            <option value="2">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table / Grid Content */}
      {isLoading ? (
        <Skeleton variant="list" count={4} />
      ) : filteredDistributions.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-card-border rounded-2xl bg-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">No Deliveries Found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              There are no active distribution tracks matching your search or filters. Click 'New Delivery' to start.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-card-border bg-card rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-card-border text-muted-foreground font-bold tracking-wide uppercase">
                  <th className="p-4">Track Catalog Title</th>
                  <th className="p-4">DSP Outlet</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Delivered / Submitted</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/80">
                {filteredDistributions.map((dist) => {
                  const id = dist.id || dist.Id;
                  const trackId = dist.trackId || dist.TrackId;
                  const dspId = dist.dspId || dist.DspId;
                  const statusVal = dist.status !== undefined ? dist.status : (dist.Status !== undefined ? dist.Status : 0);
                  const statusConfig = STATUS_MAP[statusVal] || { label: 'Pending', style: 'bg-warning/15 text-warning border-warning/20' };
                  const submittedAt = dist.submittedAt || dist.SubmittedAt;
                  const formattedDate = submittedAt ? new Date(submittedAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A';

                  const trackTitle = trackMap[trackId] || `Unknown Track (${trackId?.slice(0, 8)})`;
                  const dspName = dspMap[dspId] || `Unknown DSP (${dspId?.slice(0, 8)})`;

                  return (
                    <tr key={id} className="hover:bg-muted/20 transition-colors duration-150 group">
                      <td className="p-4 font-bold group-hover:text-primary transition-colors">{trackTitle}</td>
                      <td className="p-4 font-semibold text-foreground/80">{dspName}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${statusConfig.style}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">{formattedDate}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(dist)}
                            className="p-1.5 rounded-lg border border-card-border hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                            title="Edit distribution status"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingDist(dist)}
                            className="p-1.5 rounded-lg border border-card-border hover:bg-danger/10 hover:text-danger text-muted-foreground transition-all duration-200 cursor-pointer"
                            title="Remove log entry"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT DIALOG MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 space-y-5"
            >
              <div>
                <h4 className="text-lg font-bold">
                  {editingDist ? 'Modify Delivery Details' : 'Deliver Track to DSP'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Distribute musical catalog recordings onto active streaming services logs.
                </p>
              </div>

              {apiTracks.length === 0 || apiDsps.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold leading-relaxed space-y-3">
                  <p>
                    <strong>Requirements Missing:</strong> You need at least one track and one DSP configured to execute distribution.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg text-center cursor-pointer shadow-sm text-xs"
                  >
                    Go Back
                  </button>
                </div>
              ) : (
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    trackId: editingDist ? (editingDist.trackId || editingDist.TrackId || '') : (apiTracks[0]?.id || apiTracks[0]?.Id || ''),
                    dspId: editingDist ? (editingDist.dspId || editingDist.DspId || '') : (apiDsps[0]?.id || apiDsps[0]?.Id || ''),
                    submittedAt: editingDist
                      ? new Date(editingDist.submittedAt || editingDist.SubmittedAt).toISOString().slice(0, 16)
                      : new Date().toISOString().slice(0, 16),
                    status: editingDist ? (editingDist.status !== undefined ? editingDist.status : (editingDist.Status || 0)) : 0,
                  }}
                  validationSchema={DistributionSchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    setGlobalError(null);
                    setServerErrors({});
                    try {
                      const rawDate = new Date(values.submittedAt);
                      if (isNaN(rawDate.getTime())) {
                        throw new RangeError('Invalid submission date format.');
                      }

                      const payload = {
                        ...values,
                        status: Number(values.status),
                        submittedAt: rawDate.toISOString()
                      };

                      if (editingDist) {
                        const distId = editingDist.id || editingDist.Id;
                        await updateMutation.mutateAsync({ id: distId, data: payload });
                      } else {
                        await createMutation.mutateAsync(payload);
                      }
                    } catch (err) {
                      console.error('Distribution form submission failed:', err);
                      if (err.message) {
                        setGlobalError(err.message);
                      }

                      if (err.errors) {
                        const formErrors = {};
                        for (const [key, val] of Object.entries(err.errors)) {
                          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
                          formErrors[fieldName] = Array.isArray(val) ? val[0] : val;
                        }
                        setServerErrors(formErrors);
                      } else if (!err.message && err instanceof Error) {
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

                      {/* Track Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Catalog Track</label>
                        <Field
                          as="select"
                          name="trackId"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.trackId && touched.trackId) || serverErrors.trackId ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        >
                          {apiTracks.map((t) => (
                            <option key={t.id || t.Id} value={t.id || t.Id}>{t.title || t.Title}</option>
                          ))}
                        </Field>
                        {((errors.trackId && touched.trackId) || serverErrors.trackId) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.trackId || errors.trackId}</div>
                        )}
                      </div>

                      {/* DSP Outlet Selection */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">DSP Outlet</label>
                        <Field
                          as="select"
                          name="dspId"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.dspId && touched.dspId) || serverErrors.dspId ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        >
                          {apiDsps.map((d) => (
                            <option key={d.id || d.Id} value={d.id || d.Id}>{d.name || d.Name}</option>
                          ))}
                        </Field>
                        {((errors.dspId && touched.dspId) || serverErrors.dspId) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.dspId || errors.dspId}</div>
                        )}
                      </div>

                      {/* Submission Date-Time */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Submission Date & Time</label>
                        <Field
                          type="datetime-local"
                          name="submittedAt"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.submittedAt && touched.submittedAt) || serverErrors.submittedAt ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                        {((errors.submittedAt && touched.submittedAt) || serverErrors.submittedAt) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.submittedAt || errors.submittedAt}</div>
                        )}
                      </div>

                      {/* Status select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Ingest Delivery Status</label>
                        <Field
                          as="select"
                          name="status"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold px-4 py-3 rounded-xl outline-none transition-all duration-300 ${
                            (errors.status && touched.status) || serverErrors.status ? 'border-danger focus:ring-2 focus:ring-danger/10' : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        >
                          <option value={0}>Pending (Queued / processing)</option>
                          <option value={1}>Live (Published / available)</option>
                          <option value={2}>Rejected (Failed validation)</option>
                        </Field>
                        {((errors.status && touched.status) || serverErrors.status) && (
                          <div className="text-[10px] text-danger font-bold pl-1">{serverErrors.status || errors.status}</div>
                        )}
                      </div>

                      {/* Modal Form Actions */}
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
                          {editingDist ? 'Update Entry' : 'Start Delivery'}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deletingDist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingDist(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-card border border-card-border rounded-3xl p-6 shadow-2xl relative z-10 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold">Remove Delivery Record?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete this distribution entry? This deletes the track's delivery logs and cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingDist(null)}
                  className="flex-1 border border-card-border hover:bg-muted text-foreground font-bold text-xs py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deletingDist.id || deletingDist.Id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-danger hover:bg-danger/90 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors cursor-pointer flex justify-center items-center gap-1.5"
                >
                  {deleteMutation.isPending && <Spinner size="sm" light />}
                  Remove Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
