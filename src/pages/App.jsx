import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SEVERITY_CONFIG = {
  low: { label: "Mild", color: "#7FD67A", bg: "rgba(127,214,122,0.12)" },
  medium: { label: "Moderate", color: "#FFD166", bg: "rgba(255,209,102,0.12)" },
  high: { label: "Serious", color: "#EF6351", bg: "rgba(239,99,81,0.12)" },
};

const Leaf = ({ style }) => (
  <svg style={style} viewBox="0 0 40 60" fill="none">
    <path d="M20 58 C20 58 2 40 2 22 C2 10 10 2 20 2 C30 2 38 10 38 22 C38 40 20 58 20 58Z" fill="currentColor" opacity="0.15"/>
    <path d="M20 58 L20 8" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
    <path d="M20 20 C14 16 8 18 6 24" stroke="currentColor" strokeWidth="0.8" opacity="0.25" fill="none"/>
    <path d="M20 32 C26 28 32 30 34 36" stroke="currentColor" strokeWidth="0.8" opacity="0.25" fill="none"/>
  </svg>
);

const SpecimenDot = ({ filled }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: filled ? "#7FD67A" : "transparent",
    border: "1px solid #7FD67A", marginRight: 6, flexShrink: 0
  }}/>
);

const KOFI_URL = "https://ko-fi.com/YOUR_KOFI_USERNAME"; // replace this
const FREE_LIMIT = 3;

export default function PlantDoctor() {
  const navigate = useNavigate();
  const [plantName, setPlantName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usesLeft, setUsesLeft] = useState(() => {
    const stored = parseInt(localStorage.getItem("pd_uses") || "0");
    return Math.max(0, FREE_LIMIT - stored);
  });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setImage({ base64, mediaType: file.type, previewUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const diagnose = async () => {
    if (!symptoms.trim() && !image) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantName,
          symptoms,
          imageBase64: image?.base64 || null,
          mediaType: image?.mediaType || null,
        })
      });

      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);
      const newCount = parseInt(localStorage.getItem("pd_uses") || "0") + 1;
      localStorage.setItem("pd_uses", newCount);
      setUsesLeft(Math.max(0, FREE_LIMIT - newCount));
      setResult(parsed);
    } catch (e) {
      setError("Diagnosis failed. Please try again.");
    }

    setLoading(false);
  };

  const sev = result ? SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.low : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0F0A", color: "#E0EFD8",
      fontFamily: "'Inter', system-ui, sans-serif", padding: "0",
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #111811", position: "sticky", top: 0, background: "#0A0F0A", zIndex: 10 }}>
        <button onClick={() => navigate('/')} style={{ background: "none", border: "none", color: "#4A6B44", fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: "#E8F5E2", fontStyle: "italic" }}>
          Plant Doctor
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Corner leaves */}
      <div style={{ position: "fixed", top: 0, left: 0, color: "#7FD67A", width: 80, pointerEvents: "none" }}>
        <Leaf style={{ width: 80, transform: "rotate(-30deg) translate(-20px,-10px)" }} />
      </div>
      <div style={{ position: "fixed", top: 0, right: 0, color: "#7FD67A", width: 80, pointerEvents: "none" }}>
        <Leaf style={{ width: 80, transform: "rotate(30deg) translate(20px,-10px)" }} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "52px 24px 32px", maxWidth: 580, width: "100%" }}>
        <div style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: 11, letterSpacing: "0.25em", color: "#7FD67A",
          textTransform: "uppercase", marginBottom: 14, opacity: 0.8
        }}>
          Botanical Diagnostic Service
        </div>
        <h1 style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 400,
          margin: 0, lineHeight: 1.1, color: "#E8F5E2",
          letterSpacing: "-0.02em"
        }}>
          Plant Doctor
        </h1>
        <p style={{
          marginTop: 14, color: "#8AAE82", fontSize: 15, lineHeight: 1.6,
          fontStyle: "italic"
        }}>
          Describe what you see. We'll tell you what's wrong.
        </p>
      </div>

      {/* Form card */}
      <div style={{
        background: "#111811", border: "1px solid #1E2E1E",
        borderRadius: 16, padding: "28px 28px 24px",
        maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 24
      }}>
        {/* Image upload */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
            Photo <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional but recommended)</span>
          </label>
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", boxSizing: "border-box",
            background: "#0D150D", border: `1px dashed ${image ? "#7FD67A" : "#2A4A2A"}`,
            borderRadius: 8, cursor: "pointer", overflow: "hidden",
            minHeight: image ? "auto" : 90, transition: "border-color 0.2s"
          }}>
            <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            {image ? (
              <div style={{ position: "relative", width: "100%" }}>
                <img src={image.previewUrl} alt="Plant" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                <button onClick={e => { e.preventDefault(); setImage(null); }} style={{
                  position: "absolute", top: 8, right: 8, background: "rgba(10,15,10,0.85)",
                  border: "1px solid #2A4A2A", borderRadius: 6, color: "#8AAE82",
                  fontSize: 12, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit"
                }}>Remove</button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 14px", color: "#4A6B44" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🌿</div>
                <div style={{ fontSize: 13 }}>Tap to upload a photo of your plant</div>
              </div>
            )}
          </label>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
            Plant type <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            value={plantName}
            onChange={e => setPlantName(e.target.value)}
            placeholder="e.g. Monstera, Pothos, Fiddle Leaf Fig..."
            style={{
              width: "100%", background: "#0D150D", border: "1px solid #1E2E1E",
              borderRadius: 8, padding: "11px 14px", color: "#E0EFD8",
              fontSize: 15, outline: "none", boxSizing: "border-box",
              fontFamily: "inherit", transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#2E4E2E"}
            onBlur={e => e.target.style.borderColor = "#1E2E1E"}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
            Additional notes <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional if photo uploaded)</span>
          </label>
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            placeholder="e.g. Leaves turning yellow from the bottom up, soil stays wet for weeks..."
            rows={3}
            style={{
              width: "100%", background: "#0D150D", border: "1px solid #1E2E1E",
              borderRadius: 8, padding: "11px 14px", color: "#E0EFD8",
              fontSize: 15, outline: "none", resize: "vertical",
              fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#2E4E2E"}
            onBlur={e => e.target.style.borderColor = "#1E2E1E"}
          />
        </div>

        {/* Uses left indicator */}
        {usesLeft > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#4A6B44" }}>
              {usesLeft} free {usesLeft === 1 ? "diagnosis" : "diagnoses"} left
            </div>
          </div>
        )}

        {usesLeft === 0 ? (
          /* Paywall */
          <div style={{ background: "#0D150D", border: "1px solid #2A4A2A", borderRadius: 10, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>🌿</div>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 17, color: "#E8F5E2", marginBottom: 8 }}>
              You've used your 3 free diagnoses
            </div>
            <div style={{ fontSize: 13, color: "#6A9A62", marginBottom: 20, lineHeight: 1.6 }}>
              Support Plant Doctor on Ko-fi to unlock unlimited diagnoses.
            </div>
            <a href={KOFI_URL} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-block", background: "#FF5E5B", color: "#fff",
              borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600,
              textDecoration: "none", fontFamily: "inherit"
            }}>
              ☕ Support on Ko-fi — $5
            </a>
          </div>
        ) : (
          <button
            onClick={diagnose}
            disabled={loading || (!symptoms.trim() && !image)}
            style={{
              width: "100%", padding: "13px", borderRadius: 8,
              background: (symptoms.trim() || image) && !loading ? "#7FD67A" : "#1E2E1E",
              color: (symptoms.trim() || image) && !loading ? "#0A0F0A" : "#3A5A3A",
              border: "none", fontSize: 15, fontWeight: 600,
              cursor: (symptoms.trim() || image) && !loading ? "pointer" : "not-allowed",
              fontFamily: "inherit", letterSpacing: "0.01em",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Examining your plant..." : "Diagnose"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: "#EF6351", fontSize: 14, marginBottom: 20 }}>{error}</div>
      )}

      {/* Loading pulse */}
      {loading && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%", background: "#7FD67A",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.6
            }}/>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {/* Result — specimen card */}
      {result && sev && (
        <div style={{
          maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 48,
          animation: "fadeUp 0.4s ease"
        }}>
          <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Specimen header */}
          <div style={{
            background: "#111811", border: "1px solid #1E2E1E",
            borderRadius: "16px 16px 0 0", padding: "20px 24px 16px",
            borderBottom: "1px solid #1E2E1E"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>
                  Diagnosis
                </div>
                <div style={{
                  fontFamily: "'Georgia', serif", fontSize: 22, color: "#E8F5E2",
                  fontStyle: "italic", lineHeight: 1.2
                }}>
                  {result.diagnosis}
                </div>
              </div>
              <div style={{
                background: sev.bg, border: `1px solid ${sev.color}`,
                borderRadius: 6, padding: "4px 10px", fontSize: 11,
                color: sev.color, fontWeight: 600, letterSpacing: "0.08em",
                textTransform: "uppercase", flexShrink: 0, marginTop: 4
              }}>
                {sev.label}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{
            background: "#0E160E", border: "1px solid #1E2E1E",
            borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 24px 24px"
          }}>

            {/* What's happening + cause */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { label: "What's happening", value: result.whatsHappening },
                { label: "Likely cause", value: result.likelyCause }
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "#111811", borderRadius: 8, padding: "12px 14px",
                  border: "1px solid #1A2A1A"
                }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#C0D8B8", lineHeight: 1.55 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Treatment */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 10 }}>
                Treatment
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.treatment.map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", fontSize: 14, color: "#C0D8B8", lineHeight: 1.5 }}>
                    <SpecimenDot filled />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #1A2A1A", margin: "16px 0" }} />

            {/* Prevention + Prognosis */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "Prevention", value: result.prevention },
                { label: "Prognosis", value: result.prognosis }
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#8AAE82", lineHeight: 1.55, fontStyle: "italic" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Try another */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setResult(null); setSymptoms(""); setPlantName(""); setImage(null); }}
              style={{ background: "none", border: "none", color: "#4A6B44", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              Diagnose another plant
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "0 24px 28px", textAlign: "center", color: "#2A4A2A", fontSize: 12 }}>
        Powered by AI · Not a substitute for professional horticultural advice
      </div>
    </div>
  );
}
