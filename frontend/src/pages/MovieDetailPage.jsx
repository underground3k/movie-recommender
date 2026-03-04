import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, getPosterUrl } from "../api/tmdb";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

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
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          style={{ width: "200px", borderRadius: "8px" }}
        />

        <div>
          <h1>{movie.title}</h1>
          <p><strong>Release date:</strong> {movie.release_date}</p>
          <p><strong>Rating:</strong> ⭐ {movie.vote_average?.toFixed(1)} / 10</p>
          <p><strong>Genres:</strong> {movie.genres?.map((g) => g.name).join(", ")}</p>
          <p style={{ marginTop: "16px" }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;