import React from "react";
import "../../App.css";

export function Button({ children, className = "", style = {}, ...props }) {
  return (
    <button
      className={`custom-btn ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}