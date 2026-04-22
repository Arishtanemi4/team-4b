import React from "react";
import "../App.css";

export default function ActionColumn({ title, color, items }) {
  return (
    <div className="action-column-wrapper">
      <div className="action-column-header" style={{ backgroundColor: color }}>
        {title}
      </div>
      <div className="action-column-list">
        {items.map((item, i) => (
          <div key={i} className="action-column-item">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}