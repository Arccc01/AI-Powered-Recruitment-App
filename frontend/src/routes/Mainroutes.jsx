import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import LandingPage     from "../pages/LandingPage";
import LoginPage       from "../pages/LoginPage";
import SignupPage      from "../pages/SignupPage";
import ProtectedRoute  from "../components/ProtectedRoute";

// candidate pages
import CandidateDashboard  from "../pages/candidate/Dashboard";
import JobsPage            from "../pages/candidate/JobPage";
import JobDetailPage       from "../pages/candidate/JobDetailPage";
import ApplicationsPage    from "../pages/candidate/ApplicationsPage";
import ProfilePage         from "../pages/candidate/ProfilePage";

// recruiter pages
import RecruiterDashboard  from "../pages/recruiter/DashboardPage";
import PostJobPage         from "../pages/recruiter/PostJobPage";
import MyJobsPage          from "../pages/recruiter/MyJobsPage";
import ApplicantsPage      from "../pages/recruiter/ApplicationsPage";

function Mainroutes() {
  const { user } = useSelector((state) => state.auth);

  return (
      <Routes>
        {/* public routes */}
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* candidate routes */}
        <Route element={<ProtectedRoute role="candidate" />}>
          <Route path="/candidate/dashboard"    element={<CandidateDashboard />} />
          <Route path="/candidate/jobs"         element={<JobsPage />} />
          <Route path="/candidate/jobs/:id"     element={<JobDetailPage />} />
          <Route path="/candidate/applications" element={<ApplicationsPage />} />
          <Route path="/candidate/profile"      element={<ProfilePage />} />
        </Route>

        {/* recruiter routes */}
        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route path="/recruiter/dashboard"      element={<RecruiterDashboard />} />
          <Route path="/recruiter/post-job"       element={<PostJobPage />} />
          <Route path="/recruiter/jobs"           element={<MyJobsPage />} />
          <Route path="/recruiter/jobs/:id/applicants" element={<ApplicantsPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default Mainroutes;