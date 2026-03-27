import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authslice";
import jobsReducer from "../features/jobslice";
import resumeReducer from "../features/resumeslice";
import profileReducer from "../features/profileslice";

const store = configureStore({
  reducer: {
    auth:   authReducer,
    jobs:   jobsReducer,
    resume: resumeReducer,
    profile:profileReducer
  },
});

export default store;