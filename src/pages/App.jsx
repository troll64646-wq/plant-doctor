import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth, TIERS } from "../context/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";

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

const SpecimenDot = () => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: "#7FD67A", marginRight: 6, flexShrink: 0, marginTop: 6
  }}/>
);

export default function PlantDoctor() {
  const navigate = useNavigate();
  const { user, userData, refreshUserData } = useAuth();
  const [plantName, setPlantName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0F0A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: "#E8F5E2", fontStyle: "italic" }}>Plant Doctor</div>
        <p style={{ color: "#6A9A62", fontSize: 15 }}>Sign in to diagnose your plants</p>
        <button onClick={() => navigate("/login")} style={{ background: "#7FD67A", color: "#0A0F0A", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Sign in
        </button>
      </div>
    );
  }

  const tier = userData?.tier || "free";
  const tierInfo = TIERS[tier];
  const used = userData?.diagnosesUsed || 0;
  const limit = tierInfo.limit;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  const isLimited = remaining === 0;

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
    if (isLimited) return;
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

      // Increment usage in Firestore
      await updateDoc(doc(db, "users", user.uid), { diagnosesUsed: increment(1) });
      await refreshUserData();
      setResult(parsed);
    } catch (e) {
      setError("Diagnosis failed. Please try again.");
    }

    setLoading(false);
  };

  const sev = result ? SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.low : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F0A", color: "#E0EFD8", fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Nav */}
      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #111811", position: "sticky", top: 0, background: "#0A0F0A", zIndex: 10, boxSizing: "border-box" }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: "#E8F5E2", fontStyle: "italic" }}>Plant Doctor</div>
        <div style={{ fontSize: 12, color: "#4A6B44" }}>
          {limit === Infinity ? "Unlimited" : `${remaining} left`}
        </div>
      </div>

      {/* Corner leaves */}
      <div style={{ position: "fixed", top: 0, left: 0, color: "#7FD67A", width: 80, pointerEvents: "none" }}>
        <Leaf style={{ width: 80, transform: "rotate(-30deg) translate(-20px,-10px)" }} />
      </div>
      <div style={{ position: "fixed", top: 0, right: 0, color: "#7FD67A", width: 80, pointerEvents: "none" }}>
        <Leaf style={{ width: 80, transform: "rotate(30deg) translate(20px,-10px)" }} />
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "40px 24px 28px", maxWidth: 580, width: "100%" }}>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 11, letterSpacing: "0.25em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 14, opacity: 0.8 }}>
          Botanical Diagnostic Service
        </div>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 7vw, 52px)", fontWeight: 400, margin: 0, lineHeight: 1.1, color: "#E8F5E2", letterSpacing: "-0.02em" }}>
          What's wrong with<br /><em>your plant?</em>
        </h1>
      </div>

      {/* Paywall */}
      {isLimited ? (
        <div style={{ maxWidth: 560, width: "calc(100% - 48px)", background: "#111811", border: "1px solid #2A4A2A", borderRadius: 16, padding: "32px 28px", textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 28, marginBottom: 14 }}>🌿</div>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: "#E8F5E2", marginBottom: 10 }}>
            You've used all your {tier === "free" ? "free " : ""}diagnoses this month
          </div>
          <div style={{ fontSize: 14, color: "#6A9A62", marginBottom: 24, lineHeight: 1.7 }}>
            {tier === "free"
              ? "Upgrade to Pro for 30 diagnoses/month or Expert for unlimited."
              : "Upgrade to Expert for unlimited diagnoses."}
          </div>
          <button onClick={() => navigate("/pricing")} style={{
            background: "#7FD67A", color: "#0A0F0A", border: "none",
            borderRadius: 8, padding: "13px 32px", fontSize: 15, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}>
            See plans →
          </button>
        </div>
      ) : (
        /* Form */
        <div style={{ background: "#111811", border: "1px solid #1E2E1E", borderRadius: 16, padding: "28px 28px 24px", maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 24 }}>

          {/* Image upload */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
              Photo <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(recommended)</span>
            </label>
            <label style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "100%", boxSizing: "border-box",
              background: "#0D150D", border: `1px dashed ${image ? "#7FD67A" : "#2A4A2A"}`,
              borderRadius: 8, cursor: "pointer", overflow: "hidden", minHeight: image ? "auto" : 90,
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
                  <div style={{ fontSize: 13 }}>Tap to upload a photo</div>
                </div>
              )}
            </label>
          </div>

          {/* Plant name */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
              Plant type <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input value={plantName} onChange={e => setPlantName(e.target.value)} placeholder="e.g. Monstera, Pothos..." style={{ width: "100%", background: "#0D150D", border: "1px solid #1E2E1E", borderRadius: 8, padding: "11px 14px", color: "#E0EFD8", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>

          {/* Symptoms */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 8 }}>
              Additional notes <span style={{ color: "#4A6B44", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional if photo uploaded)</span>
            </label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Leaves turning yellow, soil stays wet..." rows={3} style={{ width: "100%", background: "#0D150D", border: "1px solid #1E2E1E", borderRadius: 8, padding: "11px 14px", color: "#E0EFD8", fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ color: "#EF6351", fontSize: 14, marginBottom: 14 }}>{error}</div>}

          <button onClick={diagnose} disabled={loading || (!symptoms.trim() && !image)} style={{
            width: "100%", padding: "13px", borderRadius: 8,
            background: (symptoms.trim() || image) && !loading ? "#7FD67A" : "#1E2E1E",
            color: (symptoms.trim() || image) && !loading ? "#0A0F0A" : "#3A5A3A",
            border: "none", fontSize: 15, fontWeight: 600,
            cursor: (symptoms.trim() || image) && !loading ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 0.2s"
          }}>
            {loading ? "Examining your plant..." : "Diagnose"}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7FD67A", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.6 }}/>
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {/* Result */}
      {result && sev && (
        <div style={{ maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 48, animation: "fadeUp 0.4s ease" }}>
          <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

          <div style={{ background: "#111811", border: "1px solid #1E2E1E", borderRadius: "16px 16px 0 0", padding: "20px 24px 16px", borderBottom: "1px solid #1E2E1E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>Diagnosis</div>
                <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: "#E8F5E2", fontStyle: "italic", lineHeight: 1.2 }}>{result.diagnosis}</div>
              </div>
              <div style={{ background: sev.bg, border: `1px solid ${sev.color}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: sev.color, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0, marginTop: 4 }}>
                {sev.label}
              </div>
            </div>
          </div>

          <div style={{ background: "#0E160E", border: "1px solid #1E2E1E", borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 24px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[{ label: "What's happening", value: result.whatsHappening }, { label: "Likely cause", value: result.likelyCause }].map(({ label, value }) => (
                <div key={label} style={{ background: "#111811", borderRadius: 8, padding: "12px 14px", border: "1px solid #1A2A1A" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#C0D8B8", lineHeight: 1.55 }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 10 }}>Treatment</div>
              {result.treatment.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", fontSize: 14, color: "#C0D8B8", lineHeight: 1.5, marginBottom: 8 }}>
                  <SpecimenDot /><span>{step}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #1A2A1A", margin: "16px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[{ label: "Prevention", value: result.prevention }, { label: "Prognosis", value: result.prognosis }].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#8AAE82", lineHeight: 1.55, fontStyle: "italic" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setResult(null); setSymptoms(""); setPlantName(""); setImage(null); }} style={{ background: "none", border: "none", color: "#4A6B44", fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              Diagnose another plant
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto", padding: "0 24px 28px", textAlign: "center", color: "#2A4A2A", fontSize: 12 }}>
        Powered by AI · Not a substitute for professional horticultural advice
      </div>
    </div>
  );
}
