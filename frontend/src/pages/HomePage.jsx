import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getMovies, searchMovies } from "../api/movies";
import Navbar from "./components/Navbar";

function MovieCard({ movie, onClick }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(!movie.posterUrl);

  return (
    <div onClick={onClick} style={styles.card}>
      <div style={styles.posterWrap}>
        {!imgError ? (
          <>
            {!imgLoaded && <div style={styles.posterSkeleton} />}
            <img
              src={movie.posterUrl}
              alt={movie.title}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                ...styles.poster,
                opacity: imgLoaded ? 1 : 0,
              }}
            />
          </>
        ) : (
          <div style={styles.posterFallback}>
            <span style={styles.posterFallbackIcon}>◈</span>
          </div>
        )}
        <div style={styles.posterOverlay} />
        {movie.voteAverage != null && (
          <div style={styles.ratingBadge}>
            ★ {movie.voteAverage.toFixed(1)}
          </div>
        )}
      </div>
      <div style={styles.cardBody}>
        <p style={styles.cardTitle}>{movie.title}</p>
        {movie.genres?.length > 0 && (
          <p style={styles.cardGenre}>{movie.genres.slice(0, 2).join(" · ")}</p>
        )}
      </div>
    </div>
  );
}

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawPage = parseInt(searchParams.get("page") || "0", 10);
  const page = isNaN(rawPage) || rawPage < 0 ? 0 : rawPage;
  const urlSearch = searchParams.get("search") || "";

  // sync search input from URL (e.g. when navigating from navbar)
  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = searchQuery.trim();
      const data = query
        ? await searchMovies(query, page)
        : await getMovies(page);
      setMovies(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) {
      console.error(e);
      setError("Could not load movies. Make sure the backend is running.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (val) => {
    setSearchQuery(val);
    setSearchParams({ search: val, page: "0" });
  };

  const goToPage = (p) => {
    const params = {};
    if (searchQuery) params.search = searchQuery;
    params.page = String(p);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={styles.page}>
      <Navbar onSearch={handleSearch} searchValue={searchQuery} />

      <main style={styles.main}>
        {/* Header */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>
            {searchQuery ? (
              <>Results for <em style={styles.accentText}>"{searchQuery}"</em></>
            ) : (
              <>Discover Films</>
            )}
          </h1>
          {!loading && movies.length > 0 && (
            <span style={styles.pageSub}>
              Page {page + 1}{totalPages > 0 ? ` of ${totalPages}` : ""}
            </span>
          )}
        </div>

        {/* States */}
        {loading && (
          <div style={styles.skeletonGrid}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={styles.skeletonCard}>
                <div style={styles.skeletonPoster} />
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: "60%", opacity: 0.5 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={styles.emptyIcon}>◈</span>
            <p style={styles.emptyText}>
              {searchQuery ? "No movies matched your search." : "No movies found."}
            </p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <div style={styles.grid}>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={() =>
                  navigate(`/movies/${movie.id}`, {
                    state: { from: `/?page=${page}${searchQuery ? `&search=${searchQuery}` : ""}` },
                  })
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, opacity: page === 0 ? 0.35 : 1 }}
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
            >
              ← Prev
            </button>

            {/* Page number pills */}
            <div style={styles.pageNumbers}>
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                // show pages around current
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i;
                } else if (page < 4) {
                  pageNum = i;
                } else if (page > totalPages - 5) {
                  pageNum = totalPages - 7 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    style={{
                      ...styles.pageNumBtn,
                      background: pageNum === page ? "var(--accent)" : "transparent",
                      color: pageNum === page ? "var(--bg)" : "var(--text-secondary)",
                    }}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              style={{ ...styles.pageBtn, opacity: page >= totalPages - 1 ? 0.35 : 1 }}
              disabled={page >= totalPages - 1}
              onClick={() => goToPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
  },
  main: {
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "40px 24px 80px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: "32px",
    gap: "16px",
    flexWrap: "wrap",
  },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "28px",
    fontWeight: 400,
    letterSpacing: "-0.01em",
    color: "var(--text-primary)",
  },
  accentText: {
    color: "var(--accent)",
    fontStyle: "italic",
  },
  pageSub: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "20px",
  },
  card: {
    cursor: "pointer",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    transition: "transform 0.18s ease, border-color 0.18s ease",
  },
  posterWrap: {
    position: "relative",
    aspectRatio: "2/3",
    overflow: "hidden",
    background: "var(--surface-2)",
  },
  poster: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s ease, opacity 0.2s",
  },
  posterSkeleton: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(110deg, var(--surface-2) 30%, var(--surface-3) 50%, var(--surface-2) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  posterFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface-2)",
  },
  posterFallbackIcon: {
    fontSize: "28px",
    color: "var(--text-muted)",
    opacity: 0.4,
  },
  posterOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to top, rgba(10,10,15,0.6) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  ratingBadge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "rgba(10,10,15,0.75)",
    backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "5px",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--accent)",
    padding: "2px 6px",
  },
  cardBody: {
    padding: "10px 12px 12px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
    lineHeight: 1.4,
    marginBottom: "3px",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  cardGenre: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "20px",
  },
  skeletonCard: {
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  skeletonPoster: {
    aspectRatio: "2/3",
    background: "linear-gradient(110deg, var(--surface) 30%, var(--surface-2) 50%, var(--surface) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    borderRadius: "var(--radius) var(--radius) 0 0",
  },
  skeletonLine: {
    height: "12px",
    borderRadius: "4px",
    margin: "10px 10px 6px",
    background: "linear-gradient(110deg, var(--surface) 30%, var(--surface-2) 50%, var(--surface) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
  errorBox: {
    padding: "24px",
    borderRadius: "var(--radius)",
    border: "1px solid rgba(232,85,85,0.2)",
    background: "rgba(232,85,85,0.06)",
    color: "#e85555",
    fontSize: "14px",
  },
  emptyBox: {
    padding: "80px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  emptyIcon: {
    fontSize: "40px",
    color: "var(--text-muted)",
    opacity: 0.4,
  },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "15px",
  },
  pagination: {
    marginTop: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid var(--border)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
  pageNumbers: {
    display: "flex",
    gap: "4px",
  },
  pageNumBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "7px",
    border: "1px solid var(--border)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
};

export default HomePage;