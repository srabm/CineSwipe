import React from "react";

const Home = () => {
  return(
    <div>
        <div className="createGroup">Create a group</div>
        <div className="joinGroup">Join a group</div>
        {user ? <MovieList user={user} /> : <AuthPage />}
    </div>
  );
};

export default Home;
