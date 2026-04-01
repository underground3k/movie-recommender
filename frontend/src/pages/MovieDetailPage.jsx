import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMovieById } from "../api/movies";
import StarRating from "./components/StarRating";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadMovie = async () => {
      try {
        setError("");
        const data = await getMovieById(id);
        if (!cancelled) {
          setMovie(data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (!cancelled) {
          setError("Failed to load movie details.");
        }
      }
    };

    loadMovie();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  }

  if (!movie) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "980px" }}>
      <button
        onClick={() => {
          if (location.state?.from) {
            navigate(location.state.from, { replace: true });
            return;
          }

          navigate(-1);
        }}
        style={{
          marginBottom: "16px",
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
        Back
      </button>

      <div
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="eager"
            style={{
              width: "260px",
              maxWidth: "100%",
              borderRadius: "12px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "260px",
              height: "390px",
              borderRadius: "12px",
              background: "#d1d5db",
            }}
          />
        )}

        <div style={{ flex: "1 1 320px" }}>
          <h1>{movie.title}</h1>
          <p>
            <strong>Release date:</strong>{" "}
            {movie.releaseDate || "Not available"}
          </p>
          <p>
            <strong>Rating:</strong>{" "}
            {movie.voteAverage != null
              ? `${movie.voteAverage.toFixed(1)} / 10`
              : "Not available"}
          </p>
          <p>
            <strong>Genres:</strong>{" "}
            {movie.genres?.join(", ") || "Not available"}
          </p>

          <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
              Your rating
            </h2>
            <StarRating value={userRating} onChange={setUserRating} />
          </div>

          <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
            {movie.overview || "Description not available."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
