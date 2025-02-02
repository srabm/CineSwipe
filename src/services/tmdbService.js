import axios from 'axios';

const TMDB_API_KEY = 'fa0e60d8fedcb38bfc19493a4a165471'; 
const BASE_URL = 'https://api.themoviedb.org/3';

export const fetchPopularMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
    });
    return response.data.results; 
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error; 
  }
};

export const fetchMovieByTitle = async (movieTitle) => {
  try {
    // search title
    const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: movieTitle,
        language: 'en-US',
      },
    });

    // If the search yields a result, fetch the movie details
    if (searchResponse.data.results.length > 0) {
      const movieId = searchResponse.data.results[0].id;
      const movieResponse = await axios.get(`${BASE_URL}/movie/${movieId}`, {
        params: {
          api_key: TMDB_API_KEY,
          language: 'en-US',
        },
      });
      return movieResponse.data; // movie details
    } else {
      throw new Error('Movie not found');
    }
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const searchMovieInTMDB = async (movieTitle) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query: movieTitle },
    });
    return response.data.results.length > 0 ? response.data.results[0] : null;
  } catch (error) {
    console.error('TMDB Search Error:', error);
    return null;
  }
};
export const fetchMovieGenres = async (selectedGenre) => {
  try {
      const response = await axios.get(`${BASE_URL}/genre/movie/list`, {
          params: {
              api_key: TMDB_API_KEY,
              language: 'en-US',
          },
      });
      return response.data.genres;
  } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
  }
};

