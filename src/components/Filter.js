import React, { useState, useEffect } from 'react';
import { fetchMovieGenres } from '../services/tmdbService'; // Import the fetch function
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth'; // Import signOut from Firebase
import '../frontend/Filter.css';  // Ensure the correct CSS is linked


function Filter() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [numSwipes, setNumSwipes] = useState(10); // Default value
  const [timePerSwipe, setTimePerSwipe] = useState(5); // Default value
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate(); // For navigation to another page

  const auth = getAuth();

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
    setSessionCode(generateUniqueCode());  // Generate and set the unique code when the component mounts
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      code: sessionCode,  // Use the generated code
      genre: selectedGenre,
      swipes: numSwipes,
      timer: timePerSwipe,
    };
    console.log('Form Data:', formData);
    // You can handle further submission logic here
  };

  return (
    <div className="filter-page">
      

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="filter-container">
        <h2>Host a Swipe Session!</h2>
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
          max="30"
        />
        <br />

        <button className='start' type='submit'>
          Start Swiping!
        </button>
      </form>
    </div>
  );
}

export default Filter;
