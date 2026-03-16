const BASE_URL = import.meta.env.VITE_API_URL;

export const getMovies = async (page = 0) => {
  const res = await fetch(`${BASE_URL}/movies?page=${page}&size=20`);
  return res.json();
};

export const getMovieById = async (id) => {
  const res = await fetch(`${BASE_URL}/movies/${id}`);
  return res.json();
};