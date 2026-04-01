import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMovieById } from "../api/movies";
import Navbar from "./components/Navbar";
import StarRating from "./components/StarRating";

function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadMovie = async () => {
      try {
        setError("");
        const data = await getMovieById(id);
        if (!cancelled) setMovie(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load movie details.");
      }
    };
    loadMovie();
    return () => { cancelled = true; };
  }, [id]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {!movie && !error && (
        <div style={styles.loadingWrap}>
          <div style={styles.skeletonDetail}>
            <div style={styles.skeletonPoster} />
            <div style={styles.skeletonContent}>
              {[80, 50, 65, 100, 100, 90].map((w, i) => (
                <div key={i} style={{ ...styles.skeletonLine, width: `${w}%`, height: i === 0 ? "28px" : "14px" }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {movie && (
        <main style={styles.main}>
          {/* Blurred backdrop */}
          {movie.posterUrl && (
            <div
              style={{
                ...styles.backdrop,
                backgroundImage: `url(${movie.posterUrl})`,
              }}
            />
          )}
          <div style={styles.backdropOverlay} />

          <div style={styles.container}>
            {/* Back button */}
            <button onClick={handleBack} style={styles.backBtn}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>

            <div style={styles.content}>
              {/* Poster */}
              <div style={styles.posterCol}>
                <div style={styles.posterWrap}>
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      onLoad={() => setImgLoaded(true)}
                      style={{
                        ...styles.poster,
                        opacity: imgLoaded ? 1 : 0,
                      }}
                    />
                  ) : (
                    <div style={styles.posterFallback}>
                      <span style={styles.posterFallbackIcon}>◈</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div style={styles.infoCol}>
                {/* Genres */}
                {movie.genres?.length > 0 && (
                  <div style={styles.genreRow}>
                    {movie.genres.map((g) => (
                      <span key={g} style={styles.genreTag}>{g}</span>
                    ))}
                  </div>
                )}

                <h1 style={styles.title}>{movie.title}</h1>

                <div style={styles.metaRow}>
                  {movie.releaseDate && (
                    <span style={styles.metaItem}>
                      <span style={styles.metaLabel}>Released</span>
                      <span>{movie.releaseDate}</span>
                    </span>
                  )}
                  {movie.voteAverage != null && (
                    <span style={styles.metaItem}>
                      <span style={styles.metaLabel}>Rating</span>
                      <span style={styles.metaRating}>★ {movie.voteAverage.toFixed(1)}</span>
                    </span>
                  )}
                </div>

                {movie.overview && (
                  <p style={styles.overview}>{movie.overview}</p>
                )}

                {/* User rating */}
                <div style={styles.ratingSection}>
                  <p style={styles.ratingLabel}>Your rating</p>
                  <StarRating value={userRating} onChange={setUserRating} />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
  },
  errorBox: {
    maxWidth: "600px",
    margin: "60px auto",
    padding: "20px 24px",
    borderRadius: "var(--radius)",
    border: "1px solid rgba(232,85,85,0.2)",
    background: "rgba(232,85,85,0.06)",
    color: "#e85555",
    fontSize: "14px",
  },
  loadingWrap: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  skeletonDetail: {
    display: "flex",
    gap: "40px",
    alignItems: "flex-start",
  },
  skeletonPoster: {
    width: "240px",
    aspectRatio: "2/3",
    borderRadius: "var(--radius-lg)",
    flexShrink: 0,
    background: "linear-gradient(110deg, var(--surface) 30%, var(--surface-2) 50%, var(--surface) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  skeletonContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    paddingTop: "12px",
  },
  skeletonLine: {
    borderRadius: "5px",
    height: "14px",
    background: "linear-gradient(110deg, var(--surface) 30%, var(--surface-2) 50%, var(--surface) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  main: {
    position: "relative",
    minHeight: "calc(100vh - 60px)",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center top",
    filter: "blur(60px) saturate(0.4)",
    opacity: 0.18,
    transform: "scale(1.05)",
    pointerEvents: "none",
    zIndex: 0,
  },
  backdropOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(10,10,15,0) 0%, var(--bg) 70%)",
    pointerEvents: "none",
    zIndex: 1,
  },
  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    background: "transparent",
    border: "1px solid var(--border)",
    borderRadius: "7px",
    padding: "6px 12px",
    marginBottom: "36px",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
  content: {
    display: "flex",
    gap: "48px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  posterCol: {
    flexShrink: 0,
    width: "240px",
  },
  posterWrap: {
    width: "240px",
    aspectRatio: "2/3",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
  },
  poster: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "opacity 0.25s",
  },
  posterFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  posterFallbackIcon: {
    fontSize: "40px",
    color: "var(--text-muted)",
    opacity: 0.3,
  },
  infoCol: {
    flex: "1 1 320px",
    paddingTop: "8px",
  },
  genreRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "16px",
  },
  genreTag: {
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--accent)",
    background: "var(--accent-dim)",
    border: "1px solid var(--accent-glow)",
    borderRadius: "5px",
    padding: "3px 8px",
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "36px",
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    color: "var(--text-primary)",
    marginBottom: "20px",
  },
  metaRow: {
    display: "flex",
    gap: "24px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "14px",
    color: "var(--text-primary)",
  },
  metaLabel: {
    fontSize: "11px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  },
  metaRating: {
    color: "var(--accent)",
    fontWeight: 600,
  },
  overview: {
    fontSize: "15px",
    lineHeight: 1.75,
    color: "var(--text-secondary)",
    marginBottom: "32px",
    maxWidth: "600px",
  },
  ratingSection: {
    padding: "20px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    display: "inline-flex",
    flexDirection: "column",
    gap: "10px",
  },
  ratingLabel: {
    fontSize: "12px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  },
};

export default MovieDetailPage;