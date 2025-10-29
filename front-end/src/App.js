
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Header from "./Header";
import Footer from "./Footer";

import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import EditProfile from "./EditProfile";

import SkillDescription from "./SkillDescription";
import DraftRequest from "./DraftRequest";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main pages with layout */}
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

          {/* Your feature pages */}
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

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
