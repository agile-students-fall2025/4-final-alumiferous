import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile'


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Authentication pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/edit-profile"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
