import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile'
import EditProfile from './EditProfile';

import SkillDescription from './SkillDescription';


function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/home"
            element={
              <>
                <Header />
                <Home />
                {/*<Footer />*/}
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <>
                <Header />
                <Profile />
                {/*<Footer />*/}
              </>
            }
          />

          <Route
            path="/edit-profile"
            element={
              <>
                <Header />
                <EditProfile />
                {/*<Footer />*/}
              </>
            }
          />

          
          <Route path="/skill/:id" element={<SkillDescription/>} />
        </Routes>
        {/*<Footer />*/}
      </BrowserRouter>
    </div>
  );
}

export default App;
