import { useEffect, useState } from "react";
import { getMovies } from "../api/movies";
import { useNavigate, useSearchParams } from "react-router-dom";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1; // 1-based for URL
  const [page, setPage] = useState(initialPage);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMovies(page - 1); // backend expects 0-based
        setMovies(data.content || []);
      } catch (e) {
        console.error(e);
        setError("Nepavyko užkrauti filmų. Patikrink ar backend veikia ir VITE_API_URL.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, isSearching]);

  useEffect(() => {
    if(!isSearching){
      setSearchParams({ page: String(page) });
    }
  }, [page, isSearching,setSearchParams]);
  const handleSearch = async () => {
    const query = searchQuery.trim();
    if(!query) {
      handleClearSearch();
      return;
    }
    setIsSearching(true);
    setLoading(true);
    setError("");
    try{
      const res = await fetch(`${API_URL}/movies/search?query=${encodeURIComponent(query)}&size=40`);
      if(!res.ok) throw new Error("Server error: ${res.status}");
      const data = await res.json();
      setMovies(data.content || []);
    } catch (e) {
      console.error(e);
      setError("Paieška nepavyko. Patikrink ar backend veikia ir VITE_API_URL.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }
  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
    setPage(1);
  };
  const handleKeyDown = (e) => {
    if(e.key === "Enter") handleSearch();
    if(e.key === "Escape") handleClearSearch();
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "16px",
        }}
      >
        <h1 style={{ margin: 0 }}>🎬 Movie Recommender</h1>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => navigate("/my-ratings")}
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            My ratings
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: "14px",
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
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
            }}
          >
            Sign up
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          maxWidth: "408px",
        }}
        >
          <input
            type="text"
            placeholder="Search for a movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Search
            </button>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
                >
                  Clear
                </button>
            )}
        </div>
        {/*Search result label */}
        {isSearching && !loading && (
          <p style={{fontSize: "13px", color: "#6b7280", marginBottom: "12px"}}>
            {movies.length > 0
              ? `Found ${movies.length} result${movies.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </p>
        )}

      {/* Antras h1 iš senos versijos atrodė kaip dublis, paliekam tik header viršuje */}
      {loading && <p>Loading movies...</p>}
      {error && (
        <p style={{ color: "red", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => navigate(`/movies/${movie.id}`)}
              style={{ width: "150px", cursor: "pointer" }}
            >
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  style={{ width: "100%" }}
                />
              ) : (
                <div
                  style={{
                    width: "150px",
                    height: "225px",
                    background: "#333",
                    borderRadius: "8px",
                  }}
                />
              )}
              <p style={{ fontSize: "12px", fontWeight: "bold" }}>{movie.title}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ← Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

export default HomePage;