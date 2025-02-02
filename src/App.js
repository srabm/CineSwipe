import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore, enableNetwork } from 'firebase/firestore'; // Import Firestore
import Home from './pages/Home';
import NoPage from './pages/NoPage';
import AuthPage from './pages/AuthPage';
import Filter from './components/Filter';
import WaitingRoom from './pages/WaitingRoom';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    // Ensure Firestore stays online
    enableNetwork(db)
      .then(() => console.log("Firestore is online"))
      .catch((error) => console.error("Error enabling Firestore network:", error));

    // Set persistence for auth
    setPersistence(auth, browserSessionPersistence)
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
        <Route path="/" element={user ? <Home user={user} /> : <AuthPage />} />
        <Route path="/home" element={user ? <Home user={user} /> : <AuthPage />} />
        <Route path="/filter" element={user ? <Filter /> : <AuthPage />} />
        <Route path="/waitingroom/:sessionCode" element={user ? <WaitingRoom /> : <AuthPage />} />        
        <Route path="*" element={<NoPage />} />
      </Routes>
    </div>
  );
};

export default App;
