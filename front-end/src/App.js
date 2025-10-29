import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import EditProfile from './EditProfile';



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
                <Footer />
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
                <Footer />
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
                <Footer />
              </>
            }
          />

          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
