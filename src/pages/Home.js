import React from "react";
import MovieList from "../components/MovieList";
import { getAuth, signOut } from "firebase/auth";

const Home = ({ user }) => {
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div>
      <h1>Welcome, {user?.displayName || "User"}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <div className="createGroup">Create a group</div>
      <div className="joinGroup">Join a group</div>
      <MovieList user={user} />
    </div>
  );
};

export default Home;
