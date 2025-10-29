import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./Header";
import Home from "./Home"; 
import Footer from "./Footer";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import SkillDescription from "./pages/SkillDescription";
import DraftRequest from "./pages/DraftRequest";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Authentication pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Main App routes (Header + Footer layout) */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/skills/:id" element={<SkillDescription />} />
                  <Route path="/requests/new" element={<DraftRequest />} />
                </Routes>
                <Footer />
              </>
            }
          />

          {/* Redirect any unknown route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
