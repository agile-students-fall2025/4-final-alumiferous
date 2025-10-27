import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';


function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
