import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../api/movies";
import StarRating from "./components/StarRating";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    getMovieById(id).then((data) => setMovie(data));
  }, [id]);

  if (!movie) return <p style={{ padding: "20px" }}>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "800px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px" }}>
        ← Back
      </button>

      <div style={{ display: "flex", gap: "24px" }}>
        <img src={movie.posterUrl} alt={movie.title} />

        <div>
          <h1>{movie.title}</h1>
          <p>
            <strong>Release date:</strong> {movie.release_date}
          </p>
          <p>
            <strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)} / 10
          </p>
          <p>
            <strong>Genres:</strong> {movie.genres?.join(", ")}
          </p>

          <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>
              Your rating
            </h2>
            <StarRating value={userRating} onChange={setUserRating} />
          </div>

          <p style={{ marginTop: "16px" }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;