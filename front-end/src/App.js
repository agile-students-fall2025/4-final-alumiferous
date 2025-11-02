import { ThemeProvider } from "./ThemeContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Shared layout
import Header from "./Header";
import Footer from "./Footer";

// Core pages
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

export default function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/onboarding" element={<OnBoarding />} />

            {/* Main pages */}
            <Route
              path="/home"
              element={
                <>
                  <Header />
                  <Home />
                  <Footer />
                </>
              }
            />

            <Route
              path="/profile"
              element={
                <>
                  <Header />
                  <Profile />
                  <Footer />
                </>
              }
            />

            <Route
              path="/edit-profile"
              element={
                <>
                  <Header />
                  <EditProfile />
                  <Footer />
                </>
              }
            />

            {/* Skills & Requests */}
            <Route
              path="/skills/:id"
              element={
                <>
                  <Header />
                  <SkillDescription />
                  <Footer />
                </>
              }
            />

            <Route
              path="/requests/new"
              element={
                <>
                  <Header />
                  <DraftRequest />
                  <Footer />
                </>
              }
            />

            {/* Settings & Account */}
            <Route
              path="/settings"
              element={
                <>
                  <Header />
                  <Settings />
                  <Footer />
                </>
              }
            />

            <Route
              path="/reset-password"
              element={
                <>
                  <Header />
                  <ResetPassword />
                  <Footer />
                </>
              }
            />

            <Route
              path="/report-problem"
              element={
                <>
                  <Header />
                  <ReportProblem />
                  <Footer />
                </>
              }
            />

            <Route
              path="/delete-account"
              element={
                <>
                  <Header />
                  <DeleteAccount />
                  <Footer />
                </>
              }
            />

            {/* Chat & Messages */}
            <Route
              path="/chat"
              element={
                <>
                  {/* <Header /> */}
                  <Chat />
                  <Footer />
                </>
              }
            />

            <Route
              path="/chat/:id"
              element={
                <>
                  {/* <Header /> */}
                  <Messages />
                  {/* <Footer /> */}
                </>
              }
            />

            {/* Requests & Upload */}
            <Route
              path="/requests"
              element={
                <>
                  <Header />
                  <Requests />
                  <Footer />
                </>
              }
            />

            <Route
              path="/upload"
              element={
                <>
                  <Header />
                  <UploadSkill />
                  <Footer />
                </>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}
