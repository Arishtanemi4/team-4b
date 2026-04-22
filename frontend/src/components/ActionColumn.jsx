import React from "react";

export default function ActionColumn({ title, color, items }) {
  return (
    <div style={{ backgroundColor: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ backgroundColor: color, color: "white", textAlign: "center", padding: "16px", fontWeight: "600", fontSize: "1.2rem" }}>
        {title}
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc", fontStyle: "italic" }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}