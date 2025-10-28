// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


//import "./App.css";
import "./App.css";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import SkillDescription from "./pages/SkillDescription";
import DraftRequest from "./pages/DraftRequest";
import logo from "./logo.svg";

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Click a sample skill to view its description page:</p>
        <div style={{ display:"flex", gap:12 }}>
          <Link className="App-link" to="/skills/react">React</Link>
          <Link className="App-link" to="/skills/carpentry">Carpentry</Link>
        </div>
      </header>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/skills/:id" element={<SkillDescription />} />
      <Route path="/requests/new" element={<DraftRequest />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
