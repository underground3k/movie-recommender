import { useEffect, useState } from "react";
import { getMovies } from "../api/movies";  // changed import
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);  // backend uses 0-based pages
  const navigate = useNavigate();

  useEffect(() => {
    getMovies(page).then((data) => setMovies(data.content)); // Spring returns .content
  }, [page]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🎬 Movie Recommender</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            style={{ width: "150px", cursor: "pointer" }}
          >
            {movie.posterUrl
              ? <img src={movie.posterUrl} alt={movie.title} style={{ width: "100%" }} />
              : <div style={{ width: "150px", height: "225px", background: "#333" }} />
            }
            <p style={{ fontSize: "12px", fontWeight: "bold" }}>{movie.title}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>← Prev</button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default HomePage;