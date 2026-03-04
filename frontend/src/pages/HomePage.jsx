import { useEffect, useState } from "react";
import { getPosterUrl } from "../api/tmdb";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // MR-13: Connect to Spring Boot (CSV Data)
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const res = await fetch(`${API_URL}/movies`);

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        setAllMovies(data);
        setMovies(data);
      } catch (err) {
        console.error("Backend connection failed.", err);
        setError(err.message || "Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // MR-12: Search Logic
  const handleSearch = () => {
    const filtered = allMovies.filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setMovies(filtered);
  };

  // MR-12: Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#242424", minHeight: "100vh", color: "white" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>🎬 Movie Recommender</h1>

      {/* MR-12: Search UI */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            padding: "10px",
            width: "300px",
            backgroundColor: "#333",
            border: "1px solid #555",
            color: "white",
            borderRadius: "4px"
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: "#00e054",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {/* MR-14: Loading State */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid #333",
            borderTop: "4px solid #00e054",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <p style={{ color: "#aaa", fontSize: "14px" }}>Loading movies...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* MR-14: Error State */}
      {!loading && error && (
        <div style={{
          backgroundColor: "#2a1a1a",
          border: "1px solid #c0392b",
          borderRadius: "8px",
          padding: "24px",
          maxWidth: "480px",
          marginTop: "40px"
        }}>
          <p style={{ margin: 0, fontSize: "18px" }}>⚠️ Something went wrong</p>
          <p style={{ color: "#aaa", margin: "8px 0 16px", fontSize: "14px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#c0392b",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Movie Grid */}
      {!loading && !error && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {movies && movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie.movieId}
                onClick={() => navigate(`/movies/${movie.movieId}`)}
                style={{
                  width: "150px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#1a1a1a",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                }}
              >
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  style={{ width: "100%", height: "225px", objectFit: "cover" }}
                />
                <div style={{ padding: "8px" }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {movie.title}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#00e054" }}>
                    {movie.genres ? movie.genres.split("|")[0] : "Movie"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#aaa" }}>No movies found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
