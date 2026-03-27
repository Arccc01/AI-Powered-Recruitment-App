import API from "./axios";

const profileAPI = {
  // profile
  getMyProfile:  ()           => API.get("/profile/me"),
  updateProfile: (data)       => API.put("/profile/update", data),
  autosave:      (data)       => API.post("/profile/autosave", data),
  getCompletion: ()           => API.get("/profile/completion"),
  getLastSaved:  ()           => API.get("/profile/last-saved"),

  // experience
  addExperience:    (data)    => API.post("/profile/experience", data),
  updateExperience: (id,data) => API.put(`/profile/experience/${id}`, data),
  deleteExperience: (id)      => API.delete(`/profile/experience/${id}`),

  // skills
  addSkill:    (data)         => API.post("/profile/skill", data),
  deleteSkill: (id)           => API.delete(`/profile/skill/${id}`),

  // projects
  addProject:    (data)       => API.post("/profile/project", data),
  updateProject: (id, data)   => API.put(`/profile/project/${id}`, data),
  deleteProject: (id)         => API.delete(`/profile/project/${id}`),

  // public
  getPublicProfile: (token)   => API.get(`/profile/share/${token}`),
};

export default profileAPI;