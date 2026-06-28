import axiosClient from './axiosClient';

// ==========================================
// ARTIST ENDPOINTS
// ==========================================

/**
 * Fetch all artists from the backend API.
 * OperationId: GetArtists
 * Endpoint: GET /api/artists
 */
export const fetchArtists = async () => {
  return axiosClient.get('api/artists');
};

/**
 * Create a new artist profile.
 * OperationId: CreateArtist
 * Endpoint: POST /api/artists
 * @param {Object} artistData
 * @param {string} artistData.name
 * @param {string} artistData.email
 * @param {string} artistData.country
 */
export const createArtist = async (artistData) => {
  return axiosClient.post('api/artists', artistData);
};

/**
 * Update an existing artist profile.
 * OperationId: UpdateArtist
 * Endpoint: PUT /api/artists/{id}
 * @param {string} id - The GUID of the artist
 * @param {Object} updateData
 * @param {string} updateData.name
 * @param {string} updateData.email
 * @param {string} updateData.country
 */
export const updateArtist = async (id, updateData) => {
  return axiosClient.put(`api/artists/${id}`, updateData);
};

/**
 * Delete an artist profile.
 * OperationId: DeleteArtist
 * Endpoint: DELETE /api/artists/{id}
 * @param {string} id - The GUID of the artist
 */
export const deleteArtist = async (id) => {
  return axiosClient.delete(`api/artists/${id}`);
};

// ==========================================
// TRACK ENDPOINTS
// ==========================================

/**
 * Fetch all tracks from the catalog.
 * OperationId: GetTracks
 * Endpoint: GET /api/tracks
 * @param {Object} [params]
 * @param {string} [params.genre]
 * @param {string} [params.artistId]
 */
export const fetchTracks = async (params = {}) => {
  return axiosClient.get('api/tracks', { params });
};

/**
 * Create a new track.
 * OperationId: CreateTrack
 * Endpoint: POST /api/tracks
 * @param {Object} trackData
 * @param {string} trackData.title
 * @param {string} trackData.artistId - GUID
 * @param {string} trackData.isrc
 * @param {string} trackData.releaseDate - ISO DateString
 * @param {string} trackData.genre
 * @param {number} trackData.status - Enum (0=Draft, 1=Submitted, 2=Distributed)
 */
export const createTrack = async (trackData) => {
  return axiosClient.post('api/tracks', trackData);
};

/**
 * Update an existing track metadata.
 * Endpoint: PUT /api/tracks/{id}
 * @param {string} id - GUID
 * @param {Object} trackData
 */
export const updateTrack = async (id, trackData) => {
  return axiosClient.put(`api/tracks/${id}`, trackData);
};

/**
 * Delete a track from the catalog.
 * Endpoint: DELETE /api/tracks/{id}
 * @param {string} id - GUID
 */
export const deleteTrack = async (id) => {
  return axiosClient.delete(`api/tracks/${id}`);
};

/**
 * Fetch a single track by ID.
 * OperationId: GetTrackById
 * Endpoint: GET /api/tracks/{id}
 * @param {string} id - GUID
 */
export const fetchTrack = async (id) => {
  return axiosClient.get(`api/tracks/${id}`);
};

// ==========================================
// DISTRIBUTION ENDPOINTS
// ==========================================

/**
 * Fetch all track distributions.
 * OperationId: GetTrackDistributions
 * Endpoint: GET /api/track-distributions
 */
export const fetchDistributions = async () => {
  return axiosClient.get('api/track-distributions');
};

/**
 * Create a new track distribution delivery.
 * OperationId: CreateTrackDistribution
 * Endpoint: POST /api/track-distributions
 * @param {Object} distData
 * @param {string} distData.trackId - GUID
 * @param {string} distData.dspId - GUID
 * @param {string} distData.submittedAt - ISO DateString
 * @param {number} distData.status - Enum
 */
export const createDistribution = async (distData) => {
  return axiosClient.post('api/track-distributions', distData);
};

/**
 * Update an existing track distribution.
 * OperationId: UpdateTrackDistribution
 * Endpoint: PUT /api/track-distributions/{id}
 * @param {string} id - The GUID of the distribution
 * @param {Object} distData
 */
export const updateDistribution = async (id, distData) => {
  return axiosClient.put(`api/track-distributions/${id}`, distData);
};

/**
 * Delete a track distribution by ID.
 * OperationId: DeleteTrackDistribution
 * Endpoint: DELETE /api/track-distributions/{id}
 * @param {string} id - The GUID of the distribution
 */
export const deleteDistribution = async (id) => {
  return axiosClient.delete(`api/track-distributions/${id}`);
};

// ==========================================
// DSP ENDPOINTS
// ==========================================

/**
 * Fetch all digital service providers (DSPs).
 * OperationId: GetDsps
 * Endpoint: GET /api/dsps
 */
export const fetchDsps = async () => {
  return axiosClient.get('api/dsps');
};

/**
 * Create a new digital service provider (DSP).
 * OperationId: CreateDsp
 * Endpoint: POST /api/dsps
 * @param {Object} dspData
 * @param {string} dspData.name
 */
export const createDsp = async (dspData) => {
  return axiosClient.post('api/dsps', dspData);
};

/**
 * Update an existing digital service provider (DSP).
 * OperationId: UpdateDsp
 * Endpoint: PUT /api/dsps/{id}
 * @param {string} id - The GUID of the DSP
 * @param {Object} dspData
 * @param {string} dspData.name
 */
export const updateDsp = async (id, dspData) => {
  return axiosClient.put(`api/dsps/${id}`, dspData);
};

/**
 * Delete a digital service provider (DSP).
 * OperationId: DeleteDsp
 * Endpoint: DELETE /api/dsps/{id}
 * @param {string} id - The GUID of the DSP
 */
export const deleteDsp = async (id) => {
  return axiosClient.delete(`api/dsps/${id}`);
};


