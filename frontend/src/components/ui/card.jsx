import React from "react";

export function Card({ children, style = {} }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", ...style }}>
      {children}
    </div>
  );
}

export function CardHeader({ children, style = {} }) {
  return (
    <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", ...style }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, style = {} }) {
  return (
    <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#334155", margin: 0, ...style }}>
      {children}
    </h2>
  );
}

export function CardContent({ children, style = {} }) {
  return (
    <div style={{ padding: "16px", ...style }}>
      {children}
    </div>
  );
}