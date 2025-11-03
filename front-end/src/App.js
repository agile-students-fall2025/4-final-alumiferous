import { ThemeProvider } from "./ThemeContext";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";

// Shared layout
import Header from "./Header";
import Footer from "./Footer";

// main pages
import Home from "./Home";
import Login from "./Login";
import Profile from "./Profile";
import EditProfile from "./EditProfile";

// Feature pages
import SkillDescription from "./SkillDescription";
import DraftRequest from "./DraftRequest";

// Settings / account
import Settings from "./Settings";
import ResetPassword from "./ResetPassword";
import ReportProblem from "./ReportProblem";
import DeleteAccount from "./DeleteAccount";

// Chat & Skills
import Chat from "./Chat";
import Messages from "./Messages";
import Requests from "./Requests";
import UploadSkill from "./UploadSkill";
import OnBoarding from "./OnBoarding";
import Savedskills from "./Savedskills";

import { SkillsProvider } from "./SkillsContext";

// ✅ Shared layout wrapper
function AppLayout() {
  return (
    <>
      <Header />
      <Outlet /> {/* Child routes */}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SkillsProvider>
        <BrowserRouter>
          <Routes>
            {/*Auth & Onboarding Routes*/}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/onboarding" element={<OnBoarding />} />

            {/*Has headers and footers*/}
            <Route element={<AppLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/saved" element={<Savedskills />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/skills/:id" element={<SkillDescription />} />
              <Route path="/requests/new" element={<DraftRequest />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/report-problem" element={<ReportProblem />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/upload" element={<UploadSkill />} />
            </Route>

            {/*Chat Pages with only footer */}
            <Route
              path="/chat"
              element={
                <>
                  <Chat />
                  <Footer />
                </>
              }
            />
            <Route path="/chat/:id" element={<Messages />} />

            {/* Default & Fallback to the log in page*/}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SkillsProvider>
    </ThemeProvider>
  );
}