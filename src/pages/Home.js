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

  const [hostRole, setHostRole] = useState(false);  // Determines whether the user is hosting or joining
  const [showJoinForm, setShowJoinForm] = useState(false);  // Controls visibility of the join form

  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    const roomCode = e.target.elements["room-code"].value.trim();
    console.log(roomCode);
    if (roomCode) {
      navigate(`/waitingroom/${roomCode}`);  // Navigate with roomCode in the URL
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
          <div 
            className="role-selection-button" 
            role="button" 
            id="join" 
            style={{ backgroundColor: showJoinForm ? '#7b7781ea' : '' }} 
            onClick={() => {
              setHostRole(false);  // Set hostRole to false (joining role)
              setShowJoinForm(true);  // Show the join form
            }}
          >
            <h2>Join a group</h2>
          </div>
          
          {showJoinForm && (  // Conditional rendering of the form
            <div className="join-content">
              <form onSubmit={handleSubmit}>
                <label className="input-join-room" htmlFor="room-code">Room code</label><br />
                <input className="input-join-room" type="text" name="room-code"></input><br />
                <input className="input-join-room" id="join-room-button" type="submit" value="Join Room"></input>
              </form>
            </div>
          )}
        </div>

        <div className="role-box">
          <div 
            className="role-selection-button" 
            role="button" 
            id="host" 
            style={{ display: hostRole ? 'none' : 'block'}} 
            onClick={() => {
              setHostRole(true);  // Set hostRole to true (host role)
              setShowJoinForm(false);  // Hide the join form
            }}
          >
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
