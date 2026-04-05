import { BrowserRouter as BrowserRouter, Route, Routes } from 'react-router-dom';
import React from 'react';
import NavBar from './components/navbar.tsx'
import CQpage from './components/cq.tsx'
import News from './components/news.tsx'
import Home from './components/home.tsx'
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
            <Route path='/' element={
              <div>
                <Home />
              </div>
            } />
            <Route path="/news" element={
              <div>
                <News />
              </div>
            } />
            <Route path="/CQ" element={
              <div>
                  <CQpage />
              </div>
            } />
            <Route path="/comic" element={
              <div>
                <h1>Comic Maker</h1>
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