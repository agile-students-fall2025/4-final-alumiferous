import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './App.css';
import Header from './Header';
import Home from './Home';
import Footer from './Footer';


function App() {
  return (
    <div className='App'>
      <Router>
        <Header />
          <Routes >
            <Route path = "/" element ={<Home />}/>
          </Routes>
        <Footer /> 
    </Router>
    </div>
    
  )
}
export default App;
