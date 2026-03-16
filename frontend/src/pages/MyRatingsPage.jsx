import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../api/movies";

function MyRatingsPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // MVP: kol nėra tikro /ratings endpoint, panaudojam pirmą filmų puslapį
        const data = await getMovies(0);
        setMovies(data.content || []);
      } catch (e) {
        console.error(e);
        setError("Nepavyko užkrauti tavo įvertinimų. Patikrink ar backend veikia ir VITE_API_URL.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#020617",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "16px",
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid rgba(148,163,184,0.5)",
            background: "transparent",
            color: "#e5e7eb",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                letterSpacing: "-0.04em",
              }}
            >
              My ratings
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#9ca3af" }}>
              Movies you have rated recently. Later this will be powered by real ratings data.
            </p>
          </div>
        </div>

        {loading && <p>Loading your rated movies...</p>}
        {error && (
          <p style={{ color: "#f97373", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        {!loading && !error && movies.length === 0 && (
          <p style={{ color: "#9ca3af" }}>
            You don't have any ratings yet. Start by opening a movie and giving it a star rating.
          </p>
        )}

        {!loading && !error && movies.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movies/${movie.id}`)}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "10px",
                  borderRadius: "12px",
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(31,41,55,0.9)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "84px",
                    borderRadius: "8px",
                    background: movie.posterUrl ? "transparent" : "#111827",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {movie.posterUrl && (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {movie.title}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "#9ca3af",
                    }}
                  >
                    Average rating:{" "}
                    <span style={{ color: "#fbbf24" }}>
                      ⭐ {movie.voteAverage?.toFixed?.(1) ?? "–"}
                    </span>
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    Your rating: <strong>coming soon</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRatingsPage;

