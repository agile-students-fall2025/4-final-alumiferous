// import logo from './logo.svg';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Signup';
import './App.css';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>

    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>

  );
}
export default App;
