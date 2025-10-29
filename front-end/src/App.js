import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Shared layout
import Header from "./Header";
import Footer from "./Footer";

// Core pages
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import EditProfile from "./EditProfile";
import SkillDescription from "./SkillDescription";

// Feature pages
import Settings from "./Settings";
import ResetPassword from "./ResetPassword";
import ReportProblem from "./ReportProblem";
import DeleteAccount from "./DeleteAccount";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Login / Signup */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Home */}
          <Route
            path="/home"
            element={
              <>
                <Header />
                <Home />
              </>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <>
                <Header />
                <Profile />
              </>
            }
          />

          {/* Edit Profile */}
          <Route
            path="/edit-profile"
            element={
              <>
                <Header />
                <EditProfile />
              </>
            }
          />

          {/* Skill Description */}
          <Route path="/skill/:id" element={<SkillDescription />} />

          {/* Settings */}
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

          {/* Reset Password */}
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

          {/* Report Problem */}
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

          {/* Delete Account */}
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

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
