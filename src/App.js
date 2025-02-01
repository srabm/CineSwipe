import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="home" element={<Home/>}/>
        <Route path="filter" element={<Filter/>}/>
        <Route path="*" element={<NoPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
