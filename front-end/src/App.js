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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

