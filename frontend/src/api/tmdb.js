const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const BACKEND_URL = "http://localhost:8080/api";

// Fetch from your Spring Boot backend (CSV data)
export const getMoviesFromBackend = async () => {
  const res = await fetch(`${BACKEND_URL}/movies`);
  return res.json(); 
};

// Fetch the visuals from TMDB using the title from your CSV
export const getTMDBMetadata = async (movieTitle) => {
  const cleanTitle = movieTitle.replace(/\s\(\d{4}\)$/, ""); // Removes year like "(1995)"
  const res = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(cleanTitle)}`
  );
  const data = await res.json();
  return data.results[0]; // Return the first matching movie found on TMDB
};

export const getPosterUrl = (path) => 
  path ? `https://image.tmdb.org/t/p/w500${path}` : "https://via.placeholder.com/500x750?text=No+Poster";