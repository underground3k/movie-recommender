import { useState } from "react";

function Star({ filled, half, onClick, onHover, onLeave, size = 24 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={filled ? "Filled star" : "Empty star"}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
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

function StarRating({ max = 5, value, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;

  return (
    <div style={styles.wrap}>
      <div style={styles.stars}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          return (
            <Star
              key={starValue}
              size={size}
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