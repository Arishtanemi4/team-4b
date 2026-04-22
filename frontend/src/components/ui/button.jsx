import React from "react";

export function Button({ children, style = {}, ...props }) {
  return (
    <button
      style={{
        backgroundColor: "#16a34a",
        color: "white",
        padding: "12px 24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "500",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        transition: "opacity 0.2s",
        ...style,
      }}
      onMouseEnter={e => e.target.style.opacity = "0.85"}
      onMouseLeave={e => e.target.style.opacity = "1"}
      {...props}
    >
      {children}
    </button>
  );
}