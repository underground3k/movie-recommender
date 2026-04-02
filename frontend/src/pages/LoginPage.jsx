import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import { loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [focused, setFocused] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      login({
        userId: payload.userId,
        username: payload.username,
        token: data.token,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to track your ratings and get recommendations.">
      <form style={styles.form} onSubmit={handleSubmit}>
        {error && <p style={styles.errorMsg}>{error}</p>}

        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          focused={focused === "email"}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          focused={focused === "password"}
          onFocus={() => setFocused("password")}
          onBlur={() => setFocused(null)}
        />

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.switchLink}>Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function Field({ id, label, type, placeholder, value, onChange, focused, onFocus, onBlur }) {
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          ...styles.input,
          borderColor: focused ? "var(--accent)" : "var(--border)",
          boxShadow: focused ? "0 0 0 3px var(--accent-dim)" : "none",
        }}
      />
    </div>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  errorMsg: {
    fontSize: "13px",
    color: "#e85555",
    background: "rgba(232,85,85,0.08)",
    border: "1px solid rgba(232,85,85,0.2)",
    borderRadius: "7px",
    padding: "10px 12px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
  },
  input: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  submitBtn: {
    marginTop: "4px",
    padding: "11px",
    borderRadius: "8px",
    border: "none",
    background: "var(--accent)",
    color: "var(--bg)",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  switchText: {
    fontSize: "13px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  switchLink: {
    color: "var(--accent)",
    fontWeight: 500,
    textDecoration: "none",
  },
};

export default LoginPage;