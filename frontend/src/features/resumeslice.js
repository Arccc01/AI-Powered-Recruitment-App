import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// upload resume
export const uploadResume = createAsyncThunk("resume/upload", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    const { data } = await API.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Upload failed");
  }
});

// get match score
export const getMatchScore = createAsyncThunk("resume/matchScore", async (jobId, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/resume/match/${jobId}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to get match score");
  }
});

const resumeSlice = createSlice({
  name: "resume",
  initialState: {
    resumeUrl:   null,
    parsed:      null,
    matchResult: null,
    loading:     false,
    error:       null,
  },
  reducers: {
    clearResumeError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResume.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(uploadResume.fulfilled,  (state, action) => {
        state.loading   = false;
        state.resumeUrl = action.payload.resume_url;
        state.parsed    = action.payload.parsed;
      })
      .addCase(uploadResume.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(getMatchScore.pending,   (state) => { state.loading = true; })
      .addCase(getMatchScore.fulfilled, (state, action) => { state.loading = false; state.matchResult = action.payload; })
      .addCase(getMatchScore.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearResumeError } = resumeSlice.actions;
export default resumeSlice.reducer;