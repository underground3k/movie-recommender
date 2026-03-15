import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #1f2937 0, #020617 55%, #000 100%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))",
          borderRadius: "24px",
          padding: "28px 24px 24px",
          boxShadow:
            "0 24px 70px rgba(0,0,0,0.65), 0 0 0 1px rgba(148,163,184,0.08)",
          border: "1px solid rgba(148,163,184,0.35)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, rgba(251,191,36,0.2), rgba(248,113,113,0.18))",
                border: "1px solid rgba(251,191,36,0.45)",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span>🎬</span>
              <span>Movie Recommender</span>
            </div>
            <h1
              style={{
                margin: "10px 0 4px",
                fontSize: "22px",
                letterSpacing: "-0.03em",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#9ca3af",
                  maxWidth: "280px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background:
                "conic-gradient(from 210deg, #f97316, #ec4899, #6366f1, #22d3ee, #f97316)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(236,72,153,0.4)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e5e7eb",
                fontSize: "20px",
              }}
            >
              🎥
            </div>
          </div>
        </div>

        {children}

        <div
          style={{
            marginTop: "18px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#6b7280",
          }}
        >
          <span>Prototype UI for Sprint 2</span>
          <Link
            to="/"
            style={{ color: "#a5b4fc", textDecoration: "none", fontWeight: 500 }}
          >
            Back to movies
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

