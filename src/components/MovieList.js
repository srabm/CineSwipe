import React, { useEffect, useState } from 'react';
import { fetchPopularMovies } from '../services/tmdbService'; // Import the service

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getMovies = async () => {
      try {
        const movieData = await fetchPopularMovies();
        setMovies(movieData);
      } catch (error) {
        setError('Failed to fetch movies');
      }
    };

    getMovies();
  }, []);

  return (
    <div>
      <h1>Popular Movies</h1>
      {error && <p>{error}</p>}
      <div className="movie-list">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <div key={movie.id} className="movie">
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <h3>{movie.title}</h3>
              <p>{movie.overview}</p>
            </div>
          ))
        ) : (
          <p>Loading movies...</p>
        )}
      </div>
    </div>
  );
};

export default MovieList;
