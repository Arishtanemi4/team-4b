function AISidebar({ isOpen, onClose }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setContent("");
      
      // Try to call the backend endpoint first
      // Fallback to text file if backend is not available
      fetch("${process.env.REACT_APP_API_URL}/api/analytics/insights")
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