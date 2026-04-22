import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function MetricCard({ title, icon, value, subtitle }) {
  return (
    <Card>
      <CardHeader style={{ textAlign: "center" }}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        {icon}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.875rem", fontWeight: "bold" }}>{value}</div>
          {subtitle && <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{subtitle}</div>}
        </div>
      </CardContent>
    </Card>
  );
}