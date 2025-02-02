import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import axios from "axios";
import { fetchPopularMovies, searchMovieInTMDB } from "../services/tmdbService";
import { getAuth, signOut } from 'firebase/auth';
import { FaDoorOpen } from "react-icons/fa";  
import { useNavigate } from 'react-router-dom'; 

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const controls = useAnimation(); // For animating card swipes

  const auth = getAuth();
  const navigate = useNavigate(); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to home/login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const getMovies = async () => {
      try {
        const movieData = await fetchPopularMovies();
        setMovies(movieData.sort(() => Math.random() - 0.5)); // Shuffle movies
      } catch (error) {
        setError("Failed to fetch movies");
      }
    };
    getMovies();
  }, []);
  

  const fetchRecommendations = async () => {
    if (likedMovies.length === 0) return;

    setLoading(true);
    setRecommendedMovies([]);

    const prompt = `
      Based on these liked movies: "${likedMovies.join(", ")}"
      and these disliked movies: "${dislikedMovies.join(", ")}",
      recommend 5 similar movies while avoiding disliked ones.
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.AIzaSyC3f6ljjJh8pPxDlHJkEo6eQrTHts1iOzk}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 1.0, maxOutputTokens: 150 },
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!generatedText) throw new Error("No recommendations received from Gemini.");

      const movieTitles = generatedText.split(",").map((title) => title.trim());
      const validMovies = [];

      for (const title of movieTitles) {
        const movie = await searchMovieInTMDB(title);
        if (movie) validMovies.push(movie);
      }

      setMovies((prevMovies) => [...prevMovies, ...validMovies]); // Append recommendations
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (!movies[currentIndex]) return;

    const movie = movies[currentIndex];

    controls.start({
      x: direction === "right" ? 1000 : -1000, // Move off-screen
      opacity: 0,
      transition: { duration: 0.3 },
    });

    setTimeout(() => {
      if (direction === "right") {
        setLikedMovies((prev) => [...prev, movie.title]);
      } else {
        setDislikedMovies((prev) => [...prev, movie.title]);
      }

      if (currentIndex < movies.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        controls.start({ x: 0, opacity: 1 }); // Reset card position
      } else {
        fetchRecommendations();
      }
    }, 300);
  };

  const currentMovie = movies[currentIndex] || recommendedMovies[currentIndex - movies.length];

  return (
    <div className="movie-container">
       {/* Logout Button */}
       <button onClick={handleLogout} className="logout-icon-button">
        <FaDoorOpen size={24} color="#fff" />
      </button>


      {error && <p>{error}</p>}

      {currentMovie ? (
        <motion.div
          className="movie-card"
          drag="x" // Enable swipe
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(event, info) => {
            if (info.velocity.x > 500) handleSwipe("right");
            else if (info.velocity.x < -500) handleSwipe("left");
          }}
          animate={controls} // Use animation controls
        >
          <img src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`} alt={currentMovie.title} />
          <h3>{currentMovie.title}</h3>
          <p>{currentMovie.overview}</p>
        </motion.div>
      ) : loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <p>No more movies to show.</p>
      )}

      <div className="buttons-container">
        <button onClick={() => handleSwipe("left")}>👎 Dislike</button>
        <button onClick={() => handleSwipe("right")}>❤️ Like</button>
      </div>
    </div>
  );
};

export default MovieList;