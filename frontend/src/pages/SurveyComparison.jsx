import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";

const imagesByTab = {
  "2": ["/image1.jpeg", "/image2.jpeg", "/image3.jpeg"],
  "3": ["/image4.jpeg", "/image5.jpeg", "/image6.jpeg"],
  "4": ["/image7.jpeg", "/image8.jpeg", "/image9.jpeg"],
  "5": ["/db/image1.png", "/db/image2.png", "/db/image3.png"],
};

function AISidebar({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContent("");
      
      fetch("/analytics_ai.txt")
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
          setContent("Error loading analytics AI insights");
          setLoading(false);
          console.error(err);
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: "20px",
          borderBottom: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          {loading && <Loader2 className="animate-spin" size={20} />}
          {content}
        </div>
      </div>
    </>
  );
}

function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handlePan = (direction) => {
    const panAmount = 50;
    switch(direction) {
      case 'up':
        setPan(prev => ({ ...prev, y: prev.y + panAmount }));
        break;
      case 'down':
        setPan(prev => ({ ...prev, y: prev.y - panAmount }));
        break;
      case 'left':
        setPan(prev => ({ ...prev, x: prev.x + panAmount }));
        break;
      case 'right':
        setPan(prev => ({ ...prev, x: prev.x - panAmount }));
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "32px"
      }}>
        {images.map((image, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              cursor: "pointer",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              width: "50%",
            }}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image}
              alt={`Analysis ${index + 1}`}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0)";
              }}
            >
              <ZoomIn color="#ffffff" size={32} />
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            flexDirection: "column",
          }}
          onClick={handleClose}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "80vh",
              overflow: "hidden",
              borderRadius: "8px",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={selectedImage}
                alt="Zoomed"
                style={{
                  maxWidth: "none",
                  maxHeight: "none",
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transition: "transform 0.3s ease",
                  cursor: zoom > 1 ? "grab" : "default",
                }}
              />
            </div>

            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                cursor: "pointer",
                color: "#ffffff",
                padding: "10px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                hover: { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              }}
            >
              <X size={32} />
            </button>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={handleZoomIn}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  padding: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleZoomOut}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  padding: "8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ZoomOut size={20} />
              </button>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                padding: "5px",
                borderRadius: "8px",
              }}
            >
              <button
                onClick={() => handlePan('up')}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  padding: "6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronUp size={18} />
              </button>
              <div style={{ display: "flex", gap: "5px" }}>
                <button
                  onClick={() => handlePan('left')}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    cursor: "pointer",
                    color: "#ffffff",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => handlePan('right')}
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    cursor: "pointer",
                    color: "#ffffff",
                    padding: "6px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <button
                onClick={() => handlePan('down')}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  color: "#ffffff",
                  padding: "6px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SurveyComparison() {
  const [activeTab, setActiveTab] = useState("2");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentImages = imagesByTab[activeTab] || [];

  return (
    <div className="app-inner">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="app-banner">Survey Comparison Analysis</div>
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            background: "#3b82f6",
            border: "none",
            cursor: "pointer",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background 0.3s",
            zIndex: 10,
            whiteSpace: "nowrap",
            marginLeft: "20px",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
        >
          <Sparkles size={18} />
          AI Insights
        </button>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "8px", 
        marginBottom: "24px",
        borderBottom: "1px solid #cbd5e1",
        padding: "0 0 16px 0"
      }}>
        {["2", "3", "4"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 20px",
              backgroundColor: activeTab === tab ? "#3b82f6" : "transparent",
              color: activeTab === tab ? "#ffffff" : "#64748b",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: activeTab === tab ? "600" : "500",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          >
            After Survey {tab}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "#1e293b", fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>
            After Survey {activeTab}
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Analysis visualizations for survey {activeTab}
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ color: "#1e293b", fontSize: "18px", fontWeight: "600", margin: "0 0 16px 0" }}>
            Analysis Visualizations
          </h3>
          <ImageGallery images={currentImages} />
        </div>
      </div>

      <AISidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}