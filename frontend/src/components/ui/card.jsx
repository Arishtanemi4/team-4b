import React from "react";
import "../../App.css";

export function Card({ children, className = "", style = {} }) {
  return (
    <div className={`custom-card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", style = {} }) {
  return (
    <div className={`custom-card-header ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", style = {} }) {
  return (
    <h2 className={`custom-card-title ${className}`} style={style}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "", style = {} }) {
  return (
    <div className={`custom-card-content ${className}`} style={style}>
      {children}
    </div>
  );
}