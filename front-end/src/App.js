import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile'
import SkillDescription from './SkillDescription';


function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Header />
        <Routes>
           <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skill/:id" element={<SkillDescription/>} />
        </Routes>
        {/*<Footer />*/}
      </BrowserRouter>
    </div>
  );
}

export default App;
