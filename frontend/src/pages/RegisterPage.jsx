import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";

function RegisterPage() {
  const [focused, setFocused] = useState(null);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start rating films and get personalized recommendations."
    >
      <form
        style={styles.form}
        onSubmit={(e) => e.preventDefault()}
      >
        <Field
          id="name"
          label="Name"
          type="text"
          placeholder="Your name"
          focused={focused === "name"}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          focused={focused === "email"}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          minLength={8}
          focused={focused === "password"}
          onFocus={() => setFocused("password")}
          onBlur={() => setFocused(null)}
        />

        <button type="submit" style={styles.submitBtn}>
          Create account
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.switchLink}>Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function Field({ id, label, type, placeholder, minLength, focused, onFocus, onBlur }) {
  return (
    <div style={styles.fieldWrap}>
      <label htmlFor={id} style={styles.label}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required
        minLength={minLength}
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

export default RegisterPage;