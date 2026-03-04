import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPosterUrl } from "../api/tmdb";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const res = await fetch(`${API_URL}/movies/${id}`);

        if (!res.ok) {
          throw new Error(`Movie not found (${res.status})`);
        }

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        console.error("Failed to load movie details:", err);
        setError(err.message || "Could not load movie details.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // MR-14: Loading State
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", backgroundColor: "#242424", gap: "16px"
      }}>
        <div style={{
          width: "48px", height: "48px",
          border: "4px solid #333", borderTop: "4px solid #00e054",
          borderRadius: "50%", animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#aaa", fontSize: "14px" }}>Loading movie...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // MR-14: Error State
  if (error) {
    return (
      <div style={{ padding: "40px", backgroundColor: "#242424", minHeight: "100vh", color: "white" }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
          ← Back
        </button>
        <div style={{
          backgroundColor: "#2a1a1a", border: "1px solid #c0392b",
          borderRadius: "8px", padding: "24px", maxWidth: "480px"
        }}>
          <p style={{ margin: 0, fontSize: "18px" }}>⚠️ Could not load movie</p>
          <p style={{ color: "#aaa", margin: "8px 0 16px", fontSize: "14px" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#c0392b", color: "white", border: "none",
              padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold"
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Safely format genres — handles both string "Action|Comedy" and array [{name: "Action"}]
  const formatGenres = (genres) => {
    if (!genres) return "N/A";
    if (typeof genres === "string") return genres.split("|").join(", ");
    if (Array.isArray(genres)) return genres.map((g) => g.name ?? g).join(", ");
    return "N/A";
  };

  // Safely format rating — handles both number and string
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return "N/A";
    const num = parseFloat(rating);
    return isNaN(num) ? "N/A" : num.toFixed(1);
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#242424", minHeight: "100vh", maxWidth: "800px", color: "white" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
        ← Back
      </button>

      <div style={{ display: "flex", gap: "24px" }}>
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          style={{ width: "200px", borderRadius: "8px" }}
        />

        <div>
          <h1>{movie.title}</h1>
          <p><strong>Release date:</strong> {movie.release_date || "N/A"}</p>
          <p><strong>Rating:</strong> ⭐ {formatRating(movie.vote_average)} / 10</p>
          <p><strong>Genres:</strong> {formatGenres(movie.genres)}</p>
          <p style={{ marginTop: "16px" }}>{movie.overview || "No description available."}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
