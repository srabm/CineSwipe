import React, { useState, useEffect } from 'react';
import { fetchMovieGenres } from '../services/tmdbService';
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../frontend/Filter.css';  // Ensure the correct CSS is linked

import '../frontend/Filter.css';
import CineSwipeLogo from '../images/Cineswipe.png';

function Filter() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [numSwipes, setNumSwipes] = useState(10);
  const [timePerSwipe, setTimePerSwipe] = useState(5);
  const [sessionCode, setSessionCode] = useState('');
  const [sessionData, setSessionData] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  const generateUniqueCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  useEffect(() => {
    const getGenres = async () => {
      try {
        const genreData = await fetchMovieGenres();
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    getGenres();
    const newSessionCode = generateUniqueCode();
    setSessionCode(newSessionCode);

    const fetchSessionData = async () => {
      const sessionRef = doc(db, "sessions", newSessionCode);
      const sessionDoc = await getDoc(sessionRef);
      if (sessionDoc.exists()) {
        setSessionData(sessionDoc.data());
      }
    };

    fetchSessionData();
  }, []);

  const createSession = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      await setDoc(sessionRef, {
        host: user.uid,
        participants: [user.uid],
        maxParticipants: numSwipes,
        sessionStatus: 'waiting',
        genre: selectedGenre,
        timePerSwipe,
        createdAt: serverTimestamp(),
      });

      console.log('Session created with code:', sessionCode);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const startRound = async () => {
    const user = auth.currentUser;
    if (!user || !sessionData || user.uid !== sessionData.host) {
      console.error('Only the host can start the round');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      await updateDoc(sessionRef, {
        sessionStatus: 'started',
      });

      console.log('Round started!');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createSession();
  };

  return (
    <div className="filter-page">

      <form onSubmit={handleSubmit} className="filter-container">
        <h2>Host a Swipe Session!</h2>
        <p>Share this code with your friends!</p>

        <label>Code: </label>
        <input name='Code' type='text' value={sessionCode} readOnly />
        <br />

        <label>Movie Genre:</label>
        <select
          name='genre'
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="">Select a Genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <br />

        <label>Number of Swipes:</label>
        <input
          name='swipes'
          type='number'
          value={numSwipes}
          onChange={(e) => setNumSwipes(Number(e.target.value))}
          min="1"
        />
        <br />

        <label>Time per Swipe (in seconds):</label>
        <input
          name='timer'
          type='number'
          value={timePerSwipe}
          onChange={(e) => setTimePerSwipe(Number(e.target.value))}
          min="1"
          max="30"
        />
        <br />

        <button className='start' type='submit'>
          Start Swiping!
        </button>
      </form>

      {sessionData?.host === auth.currentUser?.uid && (
        <button className='start-round' onClick={startRound}>
          Start the Round
        </button>
      )}
    </div>
  );
}

export default Filter;
