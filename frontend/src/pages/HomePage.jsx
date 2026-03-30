import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMovies } from "../api/movies";

function buildRetryUrl(url) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}retry=1`;
}

function MoviePoster({ posterUrl, title }) {
  const [imageUrl, setImageUrl] = useState(posterUrl);
  const [retried, setRetried] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!posterUrl);

  useEffect(() => {
    if (!posterUrl || loaded || failed || retried) {
      return undefined;
    }

    const retryTimer = setTimeout(() => {
      setRetried(true);
      setImageUrl(buildRetryUrl(posterUrl));
    }, 4000);

    return () => clearTimeout(retryTimer);
  }, [posterUrl, loaded, failed, retried]);

  if (!posterUrl || failed) {
    return (
      <div
        style={{
          width: "150px",
          height: "225px",
          background: "#333",
          borderRadius: "8px",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "150px",
        height: "225px",
        borderRadius: "8px",
        background: "#d1d5db",
        overflow: "hidden",
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!retried) {
            setRetried(true);
            setImageUrl(buildRetryUrl(posterUrl));
            return;
          }

          setFailed(true);
        }}
        style={{
          width: "150px",
          height: "225px",
          objectFit: "cover",
          display: "block",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number.parseInt(searchParams.get("page") || "0", 10);
  const page = Number.isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMovies(page);
        setMovies(data.content || []);
      } catch (loadError) {
        console.error(loadError);
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
        <h1 style={{ margin: 0 }}>Movie Recommender</h1>
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
              onClick={() =>
                navigate(`/movies/${movie.id}`, {
                  state: { from: `/?page=${page}` },
                })
              }
              style={{ width: "150px", cursor: "pointer" }}
            >
              <MoviePoster
                key={`${movie.id}-${movie.posterUrl || "missing"}`}
                posterUrl={movie.posterUrl}
                title={movie.title}
              />
              <p style={{ fontSize: "12px", fontWeight: "bold" }}>
                {movie.title}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() =>
            setSearchParams({ page: String(Math.max(0, page - 1)) })
          }
          disabled={page === 0}
        >
          Prev
        </button>
        <span>Page {page + 1}</span>
        <button onClick={() => setSearchParams({ page: String(page + 1) })}>
          Next
        </button>
      </div>
    </div>
  );
}

export default HomePage;
