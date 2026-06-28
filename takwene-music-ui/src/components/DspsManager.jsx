import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchDsps, createDsp, updateDsp, deleteDsp } from '../api/api';
import Spinner from './Spinner';
import Skeleton from './Skeleton';

// Form validation schema
const DspSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'DSP name is too short!')
    .max(50, 'DSP name is too long!')
    .required('Digital Service Provider name is required'),
});

export default function DspsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & local state
  const [editingDsp, setEditingDsp] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingDsp, setDeletingDsp] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch DSPs from API
  const { data: apiDsps = [], isLoading, refetch } = useQuery({
    queryKey: ['dsps'],
    queryFn: fetchDsps,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Create mutation
  const createMutation = useMutation({
    mutationFn: createDsp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsps'] });
      setIsCreateOpen(false);
      showToast('DSP registered successfully in secure database.');
    },
    onError: (err) => {
      console.error('API Post failed:', err);
      showToast(err.message || 'Failed to register DSP.', 'danger');
    },
  });

  // 2. Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedDsp) => {
      const { id, ...data } = updatedDsp;
      return await updateDsp(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsps'] });
      setEditingDsp(null);
      showToast('DSP details updated successfully.');
    },
    onError: (err) => {
      console.error('API Put failed:', err);
      showToast(err.message || 'Failed to update DSP details.', 'danger');
    },
  });

  // 3. Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDsp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dsps'] });
      setDeletingDsp(null);
      showToast('DSP removed successfully from database.');
    },
    onError: (err) => {
      console.error('API Delete failed:', err);
      showToast(err.message || 'Failed to delete DSP from database. It may be linked to active distributions.', 'danger');
      setDeletingDsp(null);
    },
  });

  // Filtering operations
  const filteredDsps = useMemo(() => {
    if (!Array.isArray(apiDsps)) return [];
    return apiDsps.filter((dsp) => {
      const name = dsp.name || dsp.Name || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [apiDsps, searchQuery]);

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
          <h3 className="text-2xl font-bold tracking-tight">DSP Registry</h3>
          <p className="text-xs text-muted-foreground mt-1">Manage streaming music providers, digital service pipelines, and ingestion settings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-1.5 border border-card-border bg-card hover:bg-muted text-foreground text-xs font-bold py-2.5 px-4 rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Refresh DSP registry"
          >
            {isLoading ? <Spinner size="sm" /> : (
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
              </svg>
            )}
            Refresh
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs py-2.5 px-4.5 rounded-xl shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Register DSP
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-card border border-card-border shadow-sm">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search DSP by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-card-border text-foreground text-xs font-semibold pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* DSP Grid / List */}
      {isLoading ? (
        <Skeleton variant="list" count={3} />
      ) : filteredDsps.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-card-border rounded-2xl bg-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">No DSPs Found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              There are no Digital Service Providers registered in the system. Click 'Register DSP' to add one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDsps.map((dsp) => {
            const id = dsp.id || dsp.Id;
            const name = dsp.name || dsp.Name || 'Unknown Provider';

            // Visual provider aesthetic seeding
            const colors = [
              'from-emerald-500/10 to-teal-500/5 text-emerald-500 border-emerald-500/20',
              'from-rose-500/10 to-pink-500/5 text-rose-500 border-rose-500/20',
              'from-sky-500/10 to-indigo-500/5 text-sky-500 border-sky-500/20',
              'from-amber-500/10 to-orange-500/5 text-amber-500 border-amber-500/20',
              'from-violet-500/10 to-fuchsia-500/5 text-violet-500 border-violet-500/20'
            ];
            const colorIndex = (id.charCodeAt(0) || 0) % colors.length;
            const selectedColor = colors[colorIndex];

            return (
              <motion.div
                layout
                key={id}
                className="flex flex-col justify-between p-5 rounded-2xl border border-card-border bg-card hover:border-primary/45 hover:shadow-[0_4px_20px_rgba(124,58,237,0.03)] dark:hover:shadow-[0_4px_20px_rgba(168,85,247,0.03)] transition-all duration-300 relative group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedColor} flex items-center justify-center font-black text-lg shadow-sm border`}>
                    {name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground transition-colors group-hover:text-primary">{name}</h4>
                    <span className="text-[10px] font-mono text-muted-foreground">ID: {id.slice(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-card-border/60">
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold tracking-wide uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Active Node
                  </span>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingDsp(dsp)}
                      className="p-2 rounded-lg border border-card-border hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                      title="Edit DSP details"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingDsp(dsp)}
                      className="p-2 rounded-lg border border-card-border hover:bg-danger/10 hover:text-danger text-muted-foreground transition-all duration-200 cursor-pointer"
                      title="Delete DSP"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
        {(isCreateOpen || editingDsp) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCreateOpen(false);
                setEditingDsp(null);
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
                  {editingDsp ? 'Edit DSP Registry' : 'Register New DSP'}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure streaming ingestion endpoints for track catalog delivery.
                </p>
              </div>

              <Formik
                initialValues={{
                  name: editingDsp ? (editingDsp.name || editingDsp.Name || '') : '',
                }}
                validationSchema={DspSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    if (editingDsp) {
                      await updateMutation.mutateAsync({
                        id: editingDsp.id || editingDsp.Id,
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
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Provider Name</label>
                      <div className="relative group/field">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60 group-focus-within/field:text-primary transition-colors duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <Field
                          type="text"
                          name="name"
                          placeholder="e.g. Spotify"
                          className={`w-full bg-muted/40 border text-foreground text-sm font-semibold pl-11 pr-11 py-3 rounded-xl outline-none transition-all duration-300 ${
                            errors.name && touched.name
                              ? 'border-danger focus:ring-2 focus:ring-danger/10'
                              : 'border-card-border focus:border-primary focus:ring-4 focus:ring-primary/15'
                          }`}
                        />
                      </div>
                      <AnimatePresence>
                        {errors.name && touched.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-danger font-bold pl-1 mt-0.5"
                          >
                            {errors.name}
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
                          setEditingDsp(null);
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
                        {editingDsp ? 'Save Changes' : 'Confirm Registration'}
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
        {deletingDsp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingDsp(null)}
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
                <h4 className="text-base font-bold text-foreground">Confirm DSP Deletion</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete <strong>{deletingDsp.name || deletingDsp.Name}</strong>? Active catalog deliveries to this provider might lose sync.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingDsp(null)}
                  className="flex-1 border border-card-border hover:bg-muted text-foreground font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deletingDsp.id || deletingDsp.Id)}
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
