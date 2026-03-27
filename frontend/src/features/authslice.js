import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api/axios";

// signup
export const signup = createAsyncThunk("auth/signup", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await API.post("/auth/signup", formData);
    localStorage.setItem("token", data.data.token);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Signup failed");
  }
});

// login
export const login = createAsyncThunk("auth/login", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await API.post("/auth/login", formData);
    localStorage.setItem("token", data.data.token);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

// fetch profile
export const fetchProfile = createAsyncThunk("auth/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get("/auth/profile");
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:    null,
    token:   localStorage.getItem("token") || null,
    loading: false,   
    initializing:true,
    error:   null,
  },
  reducers: {
    logout: (state) => {
      state.user    = null;
      state.token   = null;
      state.loading = false;
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── signup ────────────────────────────────────────────
    builder
      .addCase(signup.pending,   (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(signup.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── login ─────────────────────────────────────────────
    builder
      .addCase(login.pending,   (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(login.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchProfile ──────────────────────────────────────
    builder
      .addCase(fetchProfile.pending,   (state) => {
        state.loading = true;   
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.initializing = false;   
        state.user    = action.payload;
      })
      .addCase(fetchProfile.rejected,  (state) => {
        state.initializing = false;  
        state.user    = null;
        state.token   = null;   
        localStorage.removeItem("token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;