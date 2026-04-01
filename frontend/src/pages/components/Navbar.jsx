import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

function Navbar({ onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    if (!val.trim()) {
      setSearchResults([]);
      setDropdownOpen(false);
      if (isHome && onSearch) onSearch("");
      return;
    }

    if (isHome && onSearch) {
      onSearch(val);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `${BASE_URL}/movies?page=0&size=6&search=${encodeURIComponent(val)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.content || []);
          setDropdownOpen(true);
        }
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    setDropdownOpen(false);
    navigate(`/?search=${encodeURIComponent(searchValue.trim())}&page=0`);
    setSearchValue("");
  };

  const handleResultClick = (id) => {
    setDropdownOpen(false);
    setSearchValue("");
    navigate(`/movies/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>◈</span>
          <span style={styles.logoText}>Movie recommender</span>
        </Link>

        {/* Nav links */}
        <div style={styles.links}>
          <NavLink to="/" label="Discover" active={location.pathname === "/"} />
          <NavLink to="/my-ratings" label="My Ratings" active={location.pathname === "/my-ratings"} />
        </div>

        {/* Search */}
        <div style={styles.searchWrap} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <span style={styles.searchIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search movies…"
              value={searchValue}
              onChange={handleSearchChange}
              style={styles.searchInput}
              onFocus={() => searchResults.length > 0 && setDropdownOpen(true)}
            />
            {searching && <span style={styles.searchSpinner}>⟳</span>}
          </form>

          {dropdownOpen && searchResults.length > 0 && !isHome && (
            <div style={styles.dropdown}>
              {searchResults.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleResultClick(movie.id)}
                  style={styles.dropdownItem}
                >
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt="" style={styles.dropdownThumb} />
                  ) : (
                    <div style={styles.dropdownThumbEmpty} />
                  )}
                  <div style={styles.dropdownInfo}>
                    <span style={styles.dropdownTitle}>{movie.title}</span>
                    {movie.genres?.length > 0 && (
                      <span style={styles.dropdownGenre}>{movie.genres.slice(0, 2).join(", ")}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth buttons */}
        <div style={styles.authBtns}>
          {user ? (
            <>
              <span style={styles.welcomeText}>Hi, {user.username}</span>
              <button onClick={handleLogout} style={styles.btnGhost}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.btnGhost}>Log in</Link>
              <Link to="/register" style={styles.btnAccent}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      style={{
        ...styles.navLink,
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        borderBottom: active ? "1px solid var(--accent)" : "1px solid transparent",
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(10,10,15,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border)",
    height: "60px",
    display: "flex",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: {
    fontSize: "18px",
    color: "var(--accent)",
    lineHeight: 1,
  },
  logoText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "18px",
    color: "var(--text-primary)",
    letterSpacing: "0.01em",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
  },
  navLink: {
    fontSize: "14px",
    fontWeight: 500,
    padding: "4px 10px",
    borderRadius: "6px",
    transition: "color 0.15s",
    textDecoration: "none",
    paddingBottom: "3px",
  },
  searchWrap: {
    position: "relative",
    flex: 1,
    maxWidth: "320px",
  },
  searchForm: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "0 12px",
    transition: "border-color 0.15s",
  },
  searchIcon: {
    color: "var(--text-muted)",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text-primary)",
    fontSize: "14px",
    width: "100%",
    padding: "9px 0",
  },
  searchSpinner: {
    color: "var(--text-muted)",
    fontSize: "14px",
    animation: "spin 1s linear infinite",
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
    zIndex: 200,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    background: "transparent",
    border: "none",
    color: "var(--text-primary)",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    transition: "background 0.12s",
  },
  dropdownThumb: {
    width: "32px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "4px",
    flexShrink: 0,
  },
  dropdownThumbEmpty: {
    width: "32px",
    height: "48px",
    borderRadius: "4px",
    background: "var(--surface-3)",
    flexShrink: 0,
  },
  dropdownInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    overflow: "hidden",
  },
  dropdownTitle: {
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropdownGenre: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  authBtns: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "auto",
    flexShrink: 0,
  },
  welcomeText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  btnGhost: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    padding: "6px 12px",
    borderRadius: "7px",
    border: "1px solid var(--border)",
    background: "transparent",
    transition: "border-color 0.15s, color 0.15s",
    textDecoration: "none",
    cursor: "pointer",
  },
  btnAccent: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--bg)",
    padding: "6px 14px",
    borderRadius: "7px",
    border: "none",
    background: "var(--accent)",
    textDecoration: "none",
    transition: "opacity 0.15s",
  },
};

export default Navbar;