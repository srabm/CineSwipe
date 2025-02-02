import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import Home from './pages/Home';
//import Login from './pages/Login';
import NoPage from './pages/NoPage';
import AuthPage from './pages/AuthPage';
import Filter from './components/Filter';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    // Set persistence to keep user logged in after closing the browser
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);  
        });

        return unsubscribe; // Cleanup listener on unmount
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* If user is logged in, show Home, else show AuthPage */}
        <Route path="/" element={user ? <Home user={user} /> : <AuthPage />} />
        <Route path="/home" element={user ? <Home user={user} /> : <AuthPage />} />
        <Route path="/filter" element={user ? <Filter /> : <AuthPage />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </div>
  );
};

export default App;
