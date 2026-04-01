const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

const fetchJson = async (path) => {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

export const getMovies = async (page = 0) => {
  return fetchJson(`/movies?page=${page}&size=20`);
};

export const getMovieById = async (id) => {
  return fetchJson(`/movies/${id}`);
};

// Search uses the same /movies endpoint with a title filter.
// If your backend doesn't support ?search= yet, this falls back to getMovies.
export const searchMovies = async (query, page = 0) => {
  try {
    return await fetchJson(
      `/movies?page=${page}&size=20&search=${encodeURIComponent(query)}`
    );
  } catch {
    // fallback: return normal movies if backend doesn't support search param yet
    return getMovies(page);
  }
};