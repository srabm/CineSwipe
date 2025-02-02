import React, { useState } from "react";
import MovieList from "../components/MovieList";
import { getAuth, signOut } from "firebase/auth";
import Filter from "../components/Filter";
import { FaDoorOpen } from "react-icons/fa";  // Import the door icon from react-icons
import "../frontend/Home.css";

const Home = ({ user }) => {
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [ hostRole, setHostRole ] = useState(false);

  return (
    <div>
      {/* Logout Icon */}
      <button onClick={handleLogout} className="logout-icon-button">
        <FaDoorOpen size={24} color="#fff" />
      </button>
      
      <div className="role-selection">

        <div className="role-box">
          <div className="role-selection-button" role="button" id="join" style={{ backgroundColor: hostRole ? '' : '#7b7781ea'}} onClick={() => setHostRole(false)}>
            <h2>Join a group</h2>
          </div>
          <div className="join-content" style={{ display: hostRole ? 'none' : 'block'}}>
            <label className="input-join-room" htmlFor="room-code">Room code</label><br />
            <input className="input-join-room" type="text" name="room-code"></input><br />
            <input className="input-join-room" id="join-room-button" type="submit" value="JOIN ROOM"></input>
          </div>
        </div>

        <div className="role-box">
          <div className="role-selection-button" role="button" id="host" style={{ backgroundColor: hostRole ? '#7b7781ea' : ''}} onClick={() => setHostRole(true)}>
            <h2>Create a group</h2>
            <div className="host-content" style={{ display: hostRole ? 'block' : 'none'}}>
              <Filter/>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
};

export default Home;
