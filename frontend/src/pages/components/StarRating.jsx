import { useState } from "react";

function Star({ filled, onClick, onHover, onLeave }) {
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
        fontSize: "22px",
        color: filled ? "#fbbf24" : "#4b5563",
        transition: "transform 80ms ease-out, color 80ms ease-out",
      }}
    >
      {filled ? "★" : "☆"}
    </button>
  );
}

function StarRating({ max = 5, value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const displayValue = hovered ?? value;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          const filled = starValue <= displayValue;
          return (
            <Star
              key={starValue}
              filled={filled}
              onClick={() => onChange?.(starValue)}
              onHover={() => setHovered(starValue)}
              onLeave={() => setHovered(null)}
            />
          );
        })}
      </div>
      {displayValue ? (
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          Your rating: <strong>{displayValue}</strong> / {max}
        </span>
      ) : (
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          Tap a star to rate
        </span>
      )}
    </div>
  );
}

export default StarRating;

