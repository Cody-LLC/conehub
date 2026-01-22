import { BrowserRouter as BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import NavBar from './components/navbar.tsx'
import CQpage from './components/cq.tsx'
import './App.css'
import './components/NavBar.css'
import './components/cq.css'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/comic" element={
              <div>
                <h1>Comic Page</h1>
                <p>Edit this content directly in App.jsx</p>
              </div>
            } />
            <Route path="/CQ" element={
              <div>
                  <CQpage />
              </div>
            } />
            <Route path="/contacts" element={
              <div>
                <h1>MTL info</h1>
                <p>Edit this content directly in App.jsx</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;