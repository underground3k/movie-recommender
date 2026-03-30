const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

const fetchJson = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

export const getMovies = async (page = 0) => {
  return fetchJson(`/movies?page=${page}&size=20`);
};

export const getMovieById = async (id) => {
  return fetchJson(`/movies/${id}`);
};
