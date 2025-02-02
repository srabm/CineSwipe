import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchPopularMovies, searchMovieInTMDB } from '../services/tmdbService';

const Suggestion = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState([]);
  const [dislikedMovies, setDislikedMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const geminiApiKey = 'YOUR_GEMINI_API_KEY';
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        const movies = await fetchPopularMovies();
        setPopularMovies(movies);
      } catch (error) {
        console.error('Failed to fetch popular movies:', error);
      }
    };

    loadPopularMovies();
  }, []);

  const fetchRecommendations = async () => {
    if (likedMovies.length === 0) return;

    setLoading(true);
    setRecommendedMovies([]);
    setCurrentMovieIndex(0);

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
      const generatedText = response.data.candidates?.[0]?.content?.parts?.[0]?.text.trim();

      if (!generatedText) throw new Error('No recommendations received from Gemini.');

      const geminiMovies = generatedText.split(',').map((title) => title.trim());
      const validMovies = [];

      for (const movieTitle of geminiMovies) {
        const tmdbMovie = await searchMovieInTMDB(movieTitle);
        if (tmdbMovie) validMovies.push(tmdbMovie);
      }

      setRecommendedMovies(validMovies);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserResponse = (response) => {
    const currentMovie = popularMovies[currentMovieIndex];

    if (response === 'like') {
      setLikedMovies((prev) => [...prev, currentMovie.title]);
    } else {
      setDislikedMovies((prev) => [...prev, currentMovie.title]);
    }

    if (currentMovieIndex < popularMovies.length - 1) {
      setCurrentMovieIndex((prevIndex) => prevIndex + 1);
    } else {
      fetchRecommendations(); // Switch to Gemini recommendations
    }
  };

  return (
    <div>
      <h2>Movie Suggestions</h2>

      {popularMovies.length > 0 && currentMovieIndex < popularMovies.length ? (
        <div className="movie">
          <h3>{popularMovies[currentMovieIndex].title}</h3>
          <img
            src={`https://image.tmdb.org/t/p/w500${popularMovies[currentMovieIndex].poster_path}`}
            alt={popularMovies[currentMovieIndex].title}
          />
          <p>{popularMovies[currentMovieIndex].overview}</p>

          <div className="movie-actions">
            <button onClick={() => handleUserResponse('like')}>👍 Like</button>
            <button onClick={() => handleUserResponse('dislike')}>👎 Dislike</button>
          </div>
        </div>
      ) : loading ? (
        <p>Loading recommendations...</p>
      ) : recommendedMovies.length > 0 ? (
        <div className="movie">
          <h3>{recommendedMovies[currentMovieIndex].title}</h3>
          <img
            src={`https://image.tmdb.org/t/p/w500${recommendedMovies[currentMovieIndex].poster_path}`}
            alt={recommendedMovies[currentMovieIndex].title}
          />
          <p>{recommendedMovies[currentMovieIndex].overview}</p>

          <div className="movie-actions">
            <button onClick={() => handleUserResponse('like')}>👍 Like</button>
            <button onClick={() => handleUserResponse('dislike')}>👎 Dislike</button>
          </div>
        </div>
      ) : (
        <p>No more movies to show.</p>
      )}
    </div>
  );
};

export default Suggestion;
