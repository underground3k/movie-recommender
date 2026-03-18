import { useEffect, useState } from "react";
import { getMovies } from "../api/movies";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMovies(page);
        setMovies(data.content || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load movies. Check if backend is running.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1 style={{ margin: 0 }}>🎬 Movie Recommender</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 45%, #ec4899 100%)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Sign up
          </button>
        </div>
      </div>

      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movies/${movie.id}`)}
              style={{ width: "150px", cursor: "pointer" }}
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              ) : (
                <div
                  style={{
                    width: "150px",
                    height: "225px",
                    background: "#333",
                    borderRadius: "8px",
                  }}
                />
              )}
              <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                {movie.title}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          ← Prev
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default HomePage;
