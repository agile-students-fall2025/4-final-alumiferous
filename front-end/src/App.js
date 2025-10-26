import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= "/login" element = {<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
