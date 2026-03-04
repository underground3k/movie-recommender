import { useEffect, useState } from "react";
import { getMovies, getPosterUrl } from "../api/tmdb";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    getMovies(page).then((data) => setMovies(data.results));
  }, [page]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>🎬 Movie Recommender</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movies/${movie.id}`)}
            style={{
              width: "150px",
              cursor: "pointer",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              style={{ width: "100%" }}
            />
            <div style={{ padding: "8px" }}>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "12px" }}>
                {movie.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
          ← Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default HomePage;