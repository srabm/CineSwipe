import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AuthPage from './components/AuthPage';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);  
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div>
      {<AuthPage />}
    </div>
  );
};


export default App;
