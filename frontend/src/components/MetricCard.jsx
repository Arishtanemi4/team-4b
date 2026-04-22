import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import "../App.css";

export default function MetricCard({ title, icon, value, subtitle }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="metric-card-content">
        {icon}
        <div className="text-center">
          <div className="metric-card-value">{value}</div>
          {subtitle && <div className="metric-card-subtitle">{subtitle}</div>}
        </div>
      </CardContent>
    </Card>
  );
}