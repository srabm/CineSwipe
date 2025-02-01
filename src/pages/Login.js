import React from 'react';
import { getAuth, signOut } from 'firebase/auth';

const Home = ({ user }) => {
  const auth = getAuth();

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully!");
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Home;
