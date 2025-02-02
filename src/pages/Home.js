import React from "react";
import MovieList from "../components/MovieList";
import { getAuth, signOut } from "firebase/auth";
import Filter from "../components/Filter";
import { FaDoorOpen } from "react-icons/fa";  // Import the door icon from react-icons

const Home = ({ user }) => {
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      <h1>Welcome, {user?.displayName || "User"}!</h1>

      {/* Logout Icon */}
      <button onClick={handleLogout} className="logout-icon-button">
        <FaDoorOpen size={24} color="#fff" />
      </button>

      <div className="createGroup">Create a group</div>
      <div className="joinGroup">Join a group</div>
      <Filter user={user} />
    </div>
  );
};

export default Home;
