import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

function AISidebar({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContent("");
      
      // Try backend endpoint first
      fetch("http://localhost:8000/api/analytics/insights")
        .then(async (res) => {
          if (!res.ok) throw new Error("Backend not available");
          
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const text = decoder.decode(value);
            setContent(prev => prev + text);
            setLoading(false);
          }
        })
        .catch(() => {
          // Fallback to text file
          setLoading(true);
          setContent("");
          
          fetch("/ai_insights.txt")
            .then(res => res.text())
            .then(text => {
              let index = 0;
              const interval = setInterval(() => {
                if (index < text.length) {
                  setContent(prev => prev + text[index]);
                  index++;
                } else {
                  clearInterval(interval);
                  setLoading(false);
                }
              }, 20);
            })
            .catch(err => {
              setContent("Error loading analytics insights");
              setLoading(false);
              console.error(err);
            });
        });
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "400px",
          height: "100vh",
          backgroundColor: "#1e293b",
          boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.3)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={20} color="#3b82f6" />
            <h2 style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "bold", margin: 0 }}>
              AI Insights
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          color: "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.6",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>Loading insights...</span>
            </div>
          ) : content ? (
            content
          ) : (
            <span style={{ color: "#94a3b8" }}>No insights available</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

export default AISidebar;