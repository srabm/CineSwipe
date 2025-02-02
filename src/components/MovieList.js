import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchPopularMovies, searchMovieInTMDB } from '../services/tmdbService';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  // Function to shuffle movies
  const shuffleMovies = (movieArray) => {
    return movieArray.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const getMovies = async () => {
      try {
        const movieData = await fetchPopularMovies();
        setMovies(shuffleMovies(movieData)); // Randomize the order
      } catch (error) {
        setError('Failed to fetch movies');
      }
    };

    getMovies();
  }, []);

  // Fetch recommendations from Gemini
  const fetchRecommendations = async () => {
    if (likedMovies.length === 0) return;

    setLoading(true);
    setRecommendedMovies([]);
    setCurrentIndex(0);

    const prompt = `
      Based on the following movies that I like: "${likedMovies.join(', ')}",
      and these movies that I disliked: "${dislikedMovies.join(', ')}",
      please suggest 5 similar movies that match my taste and avoid those I disliked.
      Provide only a comma-separated list of movie titles.
    `;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 1.0,
        topK: 50,
        topP: 0.95,
        maxOutputTokens: 150,
      },
    };

    try {
      const response = await axios.post(geminiUrl, payload, { headers: { 'Content-Type': 'application/json' } });
      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!generatedText) throw new Error('No recommendations received from Gemini.');

      const geminiMovies = generatedText.split(',').map((title) => title.trim());
      const validMovies = [];

      for (const movieTitle of geminiMovies) {
        const tmdbMovie = await searchMovieInTMDB(movieTitle);
        if (tmdbMovie) validMovies.push(tmdbMovie);
      }

      setRecommendedMovies(shuffleMovies(validMovies)); // Randomize recommendations
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle like or dislike
  const handleResponse = (response) => {
    const isPopularMovie = currentIndex < movies.length;
    const currentMovie = isPopularMovie ? movies[currentIndex] : recommendedMovies[currentIndex - movies.length];

    if (response === 'like') {
      setLikedMovies((prev) => [...prev, currentMovie.title]);
    } else {
      setDislikedMovies((prev) => [...prev, currentMovie.title]);
    }

    // Move to the next movie
    if (isPopularMovie && currentIndex < movies.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else if (isPopularMovie && recommendedMovies.length === 0) {
      fetchRecommendations(); // Fetch recommendations if transitioning
    } else if (currentIndex - movies.length < recommendedMovies.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    } else {
      setError('No more movies available.');
    }
  };

  // Determine which movie to show
  const isPopularMovie = currentIndex < movies.length;
  const currentMovie = isPopularMovie ? movies[currentIndex] : recommendedMovies[currentIndex - movies.length];

  return (
    <div>
      {error && <p>{error}</p>}

      {currentMovie ? (
        <div className="movie">
          <img
            src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`}
            alt={currentMovie.title}
          />
          <h3>{currentMovie.title}</h3>
          <p>{currentMovie.overview}</p>
          <div className="movie-actions">
            <button onClick={() => handleResponse('like')}>👍 Like</button>
            <button onClick={() => handleResponse('dislike')}>👎 Dislike</button>
          </div>
        </div>
      ) : loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <p>No more movies to show.</p>
      )}
    </div>
  );
};

export default MovieList;