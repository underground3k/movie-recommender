import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={styles.page}>
      {/* Subtle background gradient blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>◈</span>
            <span style={styles.logoText}>Movie recommender</span>
          </Link>
          <Link to="/" style={styles.backLink}>← Back</Link>
        </div>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{title}</h1>
          {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* Form slot */}
        <div>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(232,200,74,0.06) 0%, transparent 70%)",
    top: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(100,100,200,0.05) 0%, transparent 70%)",
    bottom: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "400px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    textDecoration: "none",
  },
  logoIcon: {
    fontSize: "16px",
    color: "var(--accent)",
  },
  logoText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "17px",
    color: "var(--text-primary)",
  },
  backLink: {
    fontSize: "12px",
    color: "var(--text-muted)",
    textDecoration: "none",
    transition: "color 0.15s",
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: "26px",
    fontWeight: 400,
    color: "var(--text-primary)",
    letterSpacing: "-0.01em",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
};

export default AuthLayout;