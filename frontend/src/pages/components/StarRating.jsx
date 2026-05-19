import { useState } from "react";

function Star({ filled, onClick, onHover, onLeave, size = 24, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={disabled}
      aria-label={filled ? "Filled star" : "Empty star"}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: `${size}px`,
        color: filled ? "var(--accent)" : "var(--text-muted)",
        transition: "transform 0.1s ease, color 0.1s ease",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      {filled ? "★" : "☆"}
    </button>
  );
}

function StarRating({ max = 5, value, onChange, size = 22, disabled = false }) {
  const [hovered, setHovered] = useState(null);
  const displayValue = (disabled ? null : hovered) ?? value;

  return (
    <div style={{ ...styles.wrap, opacity: disabled ? 0.6 : 1 }}>
      <div style={styles.stars}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          return (
            <Star
              key={starValue}
              size={size}
              disabled={disabled}
              filled={starValue <= displayValue}
              onClick={() => onChange?.(starValue)}
              onHover={() => setHovered(starValue)}
              onLeave={() => setHovered(null)}
            />
          );
        })}
      </div>
      <span style={styles.label}>
        {displayValue
          ? `${displayValue} / ${max}`
          : "Tap to rate"}
      </span>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  label: {
    fontSize: "13px",
    color: "var(--text-muted)",
  },
};

export default StarRating;