import React, { useState, useEffect } from 'react';
import { fetchMovieGenres } from '../services/tmdbService'; // Import the fetch function
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'; // Add Firestore imports
import { getAuth } from 'firebase/auth';

function Filter() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [numSwipes, setNumSwipes] = useState(10); // Default value
  const [timePerSwipe, setTimePerSwipe] = useState(5); // Default value
  const [sessionCode, setSessionCode] = useState('');
  const [sessionData, setSessionData] = useState(null); // Add state for session data

  const auth = getAuth(); // Get Auth instance
  const db = getFirestore(); // Get Firestore instance

  // Function to generate a unique code
  const generateUniqueCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    return code;
  };

  // Fetch genres when the component mounts
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

    // Generate and set the unique code when the component mounts
    const newSessionCode = generateUniqueCode();
    setSessionCode(newSessionCode);

    // Fetch session data from Firestore (if it exists)
    const fetchSessionData = async () => {
      const sessionRef = doc(db, "sessions", newSessionCode);
      const sessionDoc = await getDoc(sessionRef);
      if (sessionDoc.exists()) {
        setSessionData(sessionDoc.data());
      }
    };

    fetchSessionData();
  }, []);

  // Function to create a session in Firestore
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
        participants: [user.uid], // The host is the first participant
        maxParticipants: numSwipes, // You can adjust this as per the logic
        sessionStatus: 'waiting', // Session starts in the 'waiting' state
        genre: selectedGenre,
        timePerSwipe,
        createdAt: serverTimestamp(),
      });

      console.log('Session created with code:', sessionCode);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Function to start the round (only for the host)
  const startRound = async () => {
    const user = auth.currentUser;
    if (!user || !sessionData || user.uid !== sessionData.host) {
      console.error('Only the host can start the round');
      return;
    }

    try {
      const sessionRef = doc(db, "sessions", sessionCode);
      await updateDoc(sessionRef, {
        sessionStatus: 'started', // Change the session status to 'started'
      });

      console.log('Round started!');
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      code: sessionCode,  // Use the generated code
      genre: selectedGenre,
      swipes: numSwipes,
      timer: timePerSwipe,
    };
    console.log('Form Data:', formData);

    // Create session in Firestore
    createSession();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Host a Swipe Session!</label>
      <br />
      
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

      <label>Number of Swipes</label>
      <input
        name='swipes'
        type='number'
        value={numSwipes}
        onChange={(e) => setNumSwipes(e.target.value)}
        min="1"
      />
      <br />

      <label>Time per Swipe (in seconds)</label>
      <input
        name='timer'
        type='number'
        value={timePerSwipe}
        onChange={(e) => setTimePerSwipe(e.target.value)}
        min="1"
        max="60"
      />
      <br />

      {/* Button for the host to start the round */}
      <button className='start-round' onClick={startRound}>Start Swiping!</button>
    </form>
  );
}

export default Filter;
