import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import  profileAPI  from "../api/profile.api";

// fetch full profile
export const fetchMyProfile = createAsyncThunk("profile/fetchMyProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.getMyProfile();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

// update profile
export const updateProfile = createAsyncThunk("profile/updateProfile", async (formData, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.updateProfile(formData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update profile");
  }
});

// get completion
export const fetchCompletion = createAsyncThunk("profile/fetchCompletion", async (_, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.getCompletion();
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

// experience
export const addExperience = createAsyncThunk("profile/addExperience", async (expData, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.addExperience(expData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add experience");
  }
});

export const updateExperience = createAsyncThunk("profile/updateExperience", async ({ id, expData }, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.updateExperience(id, expData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update experience");
  }
});

export const deleteExperience = createAsyncThunk("profile/deleteExperience", async (id, { rejectWithValue }) => {
  try {
    await profileAPI.deleteExperience(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete experience");
  }
});

// skills
export const addSkill = createAsyncThunk("profile/addSkill", async (skillData, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.addSkill(skillData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add skill");
  }
});

export const deleteSkill = createAsyncThunk("profile/deleteSkill", async (id, { rejectWithValue }) => {
  try {
    await profileAPI.deleteSkill(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete skill");
  }
});

// projects
export const addProject = createAsyncThunk("profile/addProject", async (projData, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.addProject(projData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to add project");
  }
});

export const updateProject = createAsyncThunk("profile/updateProject", async ({ id, projData }, { rejectWithValue }) => {
  try {
    const { data } = await profileAPI.updateProject(id, projData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update project");
  }
});

export const deleteProject = createAsyncThunk("profile/deleteProject", async (id, { rejectWithValue }) => {
  try {
    await profileAPI.deleteProject(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete project");
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile:     null,
    experiences: [],
    skills:      [],
    projects:    [],
    completion:  0,
    lastSaved:   null,
    loading:     false,
    error:       null,
  },
  reducers: {
    clearProfileError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetch profile
      .addCase(fetchMyProfile.pending,   (state) => { state.loading = true; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading     = false;
        state.profile     = action.payload.profile;
        state.experiences = action.payload.experiences || [];
        state.skills      = action.payload.skills      || [];
        state.projects    = action.payload.projects    || [];
        state.completion  = action.payload.completion  || 0;
      })
      .addCase(fetchMyProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // update profile
      .addCase(updateProfile.fulfilled,  (state, action) => { state.profile = action.payload.profile; })

      // completion
      .addCase(fetchCompletion.fulfilled,(state, action) => { state.completion = action.payload.completion_percent; })

      // experience
      .addCase(addExperience.fulfilled,    (state, action) => { state.experiences.push(action.payload.experience); })
      .addCase(updateExperience.fulfilled, (state, action) => {
        const idx = state.experiences.findIndex(e => e.id === action.payload.experience.id);
        if (idx !== -1) state.experiences[idx] = action.payload.experience;
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.experiences = state.experiences.filter(e => e.id !== action.payload);
      })

      // skills
      .addCase(addSkill.fulfilled,    (state, action) => { state.skills.push(action.payload.skill); })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.skills = state.skills.filter(s => s.id !== action.payload);
      })

      // projects
      .addCase(addProject.fulfilled,    (state, action) => { state.projects.push(action.payload.project); })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.projects.findIndex(p => p.id === action.payload.project.id);
        if (idx !== -1) state.projects[idx] = action.payload.project;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;