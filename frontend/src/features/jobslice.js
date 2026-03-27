import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// candidate — browse jobs
export const fetchJobs = createAsyncThunk("jobs/fetchJobs", async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const { data } = await API.get(`/candidate/jobs?${params}`);
    return data.data.jobs;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch jobs");
  }
});

// candidate — apply to job
export const applyToJob = createAsyncThunk("jobs/applyToJob", async (jobId, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/candidate/jobs/${jobId}/apply`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to apply");
  }
});

// candidate — my applications
export const fetchMyApplications = createAsyncThunk("jobs/fetchMyApplications", async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get("/candidate/applications");
    return data.data.applications;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch applications");
  }
});

// recruiter — post job
export const postJob = createAsyncThunk("jobs/postJob", async (jobData, { rejectWithValue }) => {
  try {
    const { data } = await API.post("/recruiter/jobs", jobData);
    return data.data.job;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to post job");
  }
});

// recruiter — my posted jobs
export const fetchMyJobs = createAsyncThunk("jobs/fetchMyJobs", async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get("/recruiter/jobs");
    return data.data.jobs;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch jobs");
  }
});

// recruiter — get applicants
export const fetchApplicants = createAsyncThunk("jobs/fetchApplicants", async (jobId, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/recruiter/jobs/${jobId}/applicants`);
    return data.data.applicants;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch applicants");
  }
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs:         [],
    myJobs:       [],
    applications: [],
    applicants:   [],
    loading:      false,
    error:        null,
  },
  reducers: {
    clearJobsError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending,            (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled,          (state, action) => { state.loading = false; state.jobs = action.payload; })
      .addCase(fetchJobs.rejected,           (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchMyApplications.pending,  (state) => { state.loading = true; })
      .addCase(fetchMyApplications.fulfilled,(state, action) => { state.loading = false; state.applications = action.payload; })
      .addCase(fetchMyApplications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchMyJobs.pending,          (state) => { state.loading = true; })
      .addCase(fetchMyJobs.fulfilled,        (state, action) => { state.loading = false; state.myJobs = action.payload; })
      .addCase(fetchMyJobs.rejected,         (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchApplicants.pending,      (state) => { state.loading = true; })
      .addCase(fetchApplicants.fulfilled,    (state, action) => { state.loading = false; state.applicants = action.payload; })
      .addCase(fetchApplicants.rejected,     (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearJobsError } = jobsSlice.actions;
export default jobsSlice.reducer;