import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./components/Navbar";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

function MyRatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${BASE_URL}/ratings/${user.userId}`);
        if (!res.ok) throw new Error("Failed to load ratings");
        const data = await res.json();
        setRatings(data);
      } catch (e) {
        console.error(e);
        setError("Could not load your ratings. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [user]);

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>My Ratings</h1>
          {!loading && ratings.length > 0 && (
            <span style={styles.pageSub}>{ratings.length} film{ratings.length !== 1 ? "s" : ""} rated</span>
          )}
        </div>

        {/* Not logged in */}
        {!user && (
          <div style={styles.emptyBox}>
            <span style={styles.emptyIcon}>◈</span>
            <p style={styles.emptyText}>You need to be logged in to see your ratings.</p>
            <div style={styles.authLinks}>
              <button onClick={() => navigate("/login")} style={styles.btnAccent}>Log in</button>
              <button onClick={() => navigate("/register")} style={styles.btnGhost}>Sign up</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {user && loading && (
          <div style={styles.skeletonList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={styles.skeletonItem}>
                <div style={styles.skeletonThumb} />
                <div style={styles.skeletonLines}>
                  <div style={{ ...styles.skeletonLine, width: "50%" }} />
                  <div style={{ ...styles.skeletonLine, width: "30%", opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {user && !loading && error && (
          <div style={styles.errorBox}>
            <p>{error}</p>
          </div>
        )}

        {/* Empty state */}
        {user && !loading && !error && ratings.length === 0 && (
          <div style={styles.emptyBox}>
            <span style={styles.emptyIcon}>◈</span>
            <p style={styles.emptyText}>You haven't rated any films yet.</p>
            <button onClick={() => navigate("/")} style={styles.btnAccent}>
              Browse films
            </button>
          </div>
        )}

        {/* Ratings list */}
        {user && !loading && !error && ratings.length > 0 && (
          <div style={styles.list}>
            {ratings.map((rating) => (
              <div
                key={rating.ratingId}
                style={styles.item}
                onClick={() => navigate(`/movies/${rating.movieId}`)}
              >
                <div style={styles.itemInfo}>
                  <p style={styles.itemTitle}>{rating.movieTitle}</p>
                  <div style={styles.starsRow}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: "18px",
                          color: i < rating.stars ? "var(--accent)" : "var(--text-muted)",
                          lineHeight: 1,
                        }}
                      >
                        {i < rating.stars ? "★" : "☆"}
                      </span>
                    ))}
                    <span style={styles.starsLabel}>{rating.stars} / 5</span>
                  </div>
                </div>
                <span style={styles.viewLink}>View →</span>
              </div>
            ))}
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
    maxWidth: "800px",
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
  pageSub: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 20px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
  },
  itemInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  itemTitle: {
    fontSize: "15px",
    fontWeight: 500,
    color: "var(--text-primary)",
  },
  starsRow: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  starsLabel: {
    fontSize: "12px",
    color: "var(--text-muted)",
    marginLeft: "6px",
  },
  viewLink: {
    fontSize: "13px",
    color: "var(--text-muted)",
    flexShrink: 0,
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
  authLinks: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },
  btnAccent: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--bg)",
    padding: "8px 18px",
    borderRadius: "7px",
    border: "none",
    background: "var(--accent)",
    cursor: "pointer",
  },
  btnGhost: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    padding: "8px 18px",
    borderRadius: "7px",
    border: "1px solid var(--border)",
    background: "transparent",
    cursor: "pointer",
  },
  errorBox: {
    padding: "24px",
    borderRadius: "var(--radius)",
    border: "1px solid rgba(232,85,85,0.2)",
    background: "rgba(232,85,85,0.06)",
    color: "#e85555",
    fontSize: "14px",
  },
  skeletonList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  skeletonItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px 20px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--border)",
    background: "var(--surface)",
  },
  skeletonThumb: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    background: "linear-gradient(110deg, var(--surface-2) 30%, var(--surface-3) 50%, var(--surface-2) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
    flexShrink: 0,
  },
  skeletonLines: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  skeletonLine: {
    height: "12px",
    borderRadius: "4px",
    background: "linear-gradient(110deg, var(--surface-2) 30%, var(--surface-3) 50%, var(--surface-2) 70%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  },
};

export default MyRatingsPage;