import { Link } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";

function LoginPage() {
  return (
    <AuthLayout title="Welcome back">
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        onSubmit={(e) => e.preventDefault()}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="email" style={{ fontSize: "14px" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #d0d0d0",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label htmlFor="password" style={{ fontSize: "14px" }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            style={{
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #d0d0d0",
              fontSize: "14px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: "8px",
            padding: "10px 12px",
            borderRadius: "999px",
            border: "none",
            background:
              "linear-gradient(135deg, #ff4b2b 0%, #ff416c 50%, #ffb347 100%)",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          Log in
        </button>

        <p style={{ fontSize: "13px", textAlign: "center", marginTop: "4px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#ff416c", fontWeight: "600" }}>
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;

