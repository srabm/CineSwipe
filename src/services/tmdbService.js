import axios from 'axios';

const TMDB_API_KEY = 'fa0e60d8fedcb38bfc19493a4a165471'; 
const BASE_URL = 'https://api.themoviedb.org/3';

// Fetch popular movies
export const fetchPopularMovies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        page: 1,
      },
    });
    return response.data.results; // Return the list of movies
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error; // Rethrow error to handle in the component
  }
};

