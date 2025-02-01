import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import './App.css';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'; // Fixed imports
import AuthPage from './components/AuthPage';
import Home from './components/Home'; // Import Home component
import MovieList from './components/MovieList'; // Import MovieList component

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    // Set persistence to keep user logged in even after browser is closed
    setPersistence(auth, browserLocalPersistence) 
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);  // Update user state based on auth changes
        });

        // Cleanup the listener on component unmount
        return () => unsubscribe(); 
      })
      .catch((error) => {
        console.error('Error setting persistence: ', error);
      });
  }, []);

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
};

export default App;
