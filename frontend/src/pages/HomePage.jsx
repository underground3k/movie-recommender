import { useEffect, useState } from "react";
import { getMovies } from "../api/tmdb";

function HomePage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies().then((data) => setMovies(data.results));
  }, []);

  return (
    <div>
      <h1>Movie Recommender 🎬</h1>
      {movies.map((m) => (
        <p key={m.id}>{m.title}</p>
      ))}
    </div>
  );
}

export default HomePage;