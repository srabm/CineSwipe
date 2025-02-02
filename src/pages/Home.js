import React, { useState } from "react";
import MovieList from "../components/MovieList";
import { getAuth, signOut } from "firebase/auth";
import Filter from "../components/Filter";
import { FaDoorOpen } from "react-icons/fa";  // Import the door icon from react-icons
import "../frontend/Home.css";
import WaitingRoom from "./WaitingRoom";
import { useNavigate } from "react-router-dom";

const Home = ({ user }) => {
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [hostRole, setHostRole] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    const roomCode = e.target.elements["room-code"].value.trim();
    if (roomCode) {
      navigate(`/waiting-room/${roomCode}`);  // Navigate with roomCode in the URL
    } else {
      alert("Please enter a valid room code.");
    }
  }

  return (
    <div>
      {/* Logout Icon */}
      <button onClick={handleLogout} className="logout-icon-button">
        <FaDoorOpen size={24} color="#fff" />
      </button>
      
      <div className="role-selection">

        <div className="role-box">
          <div className="role-selection-button" role="button" id="join" style={{ backgroundColor: hostRole ? '' : '#7b7781ea' }} onClick={() => setHostRole(false)}>
            <h2>Join a group</h2>
          </div>
          <div className="join-content" style={{ display: hostRole ? 'none' : 'block'}}>
            <form onSubmit={handleSubmit}>
              <label className="input-join-room" htmlFor="room-code">Room code</label><br />
              <input className="input-join-room" type="text" name="room-code"></input><br />
              <input className="input-join-room" id="join-room-button" type="submit" value="JOIN ROOM"></input>
            </form>
          </div>
        </div>

        <div className="role-box">
          <div className="role-selection-button" role="button" id="host" style={{ display: hostRole ? 'none' : 'block'}} onClick={() => setHostRole(true)}>
            <h2>Create a group</h2>
          </div>
            <div className="host-content" style={{ display: hostRole ? 'block' : 'none'}}>
              <Filter/>
            </div>
          
        </div>
      </div>
    </div>
  ); 
};

export default Home;
