import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth, TIERS } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import HamburgerMenu from "../components/HamburgerMenu";

const SEV = {
  low: { label: "Mild", color: "#7FD67A", bg: "rgba(127,214,122,0.12)" },
  medium: { label: "Moderate", color: "#FFD166", bg: "rgba(255,209,102,0.12)" },
  high: { label: "Serious", color: "#EF6351", bg: "rgba(239,99,81,0.12)" },
};

export default function PlantDoctor() {
  const navigate = useNavigate();
  const { user, userData, loading, refreshUserData } = useAuth();
  const { theme } = useTheme();
  const [plantName, setPlantName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [diagnosisId, setDiagnosisId] = useState(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [error, setError] = useState(null);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Loading state — wait for Firebase auth to restore
  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }} />;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: theme.text, fontStyle: "italic" }}>Plant Doctor</div>
      <p style={{ color: theme.textMuted, fontSize: 15 }}>Sign in to diagnose your plants</p>
      <button onClick={() => navigate("/login")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
        Sign in
      </button>
    </div>
  );

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
    reader.onload = () => setImage({ base64: reader.result.split(",")[1], mediaType: file.type, previewUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const diagnose = async () => {
    if (!symptoms.trim() && !image) return;
    if (isLimited) return;
    setLoadingDiag(true);
    setResult(null);
    setError(null);
    setCheckedSteps([]);
    setChatMessages([]);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plantName, symptoms, imageBase64: image?.base64 || null, mediaType: image?.mediaType || null })
      });
      const parsed = await response.json();
      if (parsed.error) throw new Error(parsed.error);

      // Show result immediately
      setResult(parsed);

      // Save to Firestore separately — don't block result on this
      try {
        const ref = await addDoc(collection(db, "users", user.uid, "diagnoses"), {
          ...parsed, plantName: plantName || "Unknown", timestamp: serverTimestamp()
        });
        setDiagnosisId(ref.id);
        await updateDoc(doc(db, "users", user.uid), { diagnosesUsed: increment(1) });
        await refreshUserData();
      } catch (fsErr) {
        console.error("Firestore save failed:", fsErr);
      }
    } catch (e) {
      setError("Diagnosis failed. Please try again.");
    }
    setLoadingDiag(false);
  };

  const toggleStep = async (i) => {
    const next = checkedSteps.includes(i) ? checkedSteps.filter(x => x !== i) : [...checkedSteps, i];
    setCheckedSteps(next);
    if (diagnosisId) {
      await updateDoc(doc(db, "users", user.uid, "diagnoses", diagnosisId), { checkedSteps: next });
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !result) return;
    const msg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diagnosis: result, messages: newMessages })
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setChatMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't respond. Please try again." }]);
    }
    setChatLoading(false);
  };

  const sev = result ? SEV[result.severity] || SEV.low : null;

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center" }}>

      <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, background: theme.bg, zIndex: 10, boxSizing: "border-box" }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: theme.text, fontStyle: "italic" }}>Plant Doctor</div>
        <div style={{ fontSize: 12, color: theme.textDim }}>
          {limit === Infinity ? "Unlimited" : `${remaining} left`}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "40px 24px 28px", maxWidth: 580, width: "100%" }}>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 400, margin: 0, lineHeight: 1.1, color: theme.text, letterSpacing: "-0.02em" }}>
          What's wrong with<br /><em>your plant?</em>
        </h1>
      </div>

      {isLimited ? (
        <div style={{ maxWidth: 560, width: "calc(100% - 48px)", background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "32px 28px", textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 28, marginBottom: 14 }}>🌿</div>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: theme.text, marginBottom: 10 }}>
            You've used all your diagnoses this month
          </div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
            {tier === "free" ? "Upgrade to Pro for 30/month or Expert for unlimited." : "Upgrade to Expert for unlimited diagnoses."}
          </div>
          <button onClick={() => navigate("/pricing")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "13px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            See plans →
          </button>
        </div>
      ) : (
        <div style={{ background: theme.surface, border: `1px solid ${theme.border2}`, borderRadius: 16, padding: "28px 28px 24px", maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 24 }}>

          {/* Image upload */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: theme.accent, textTransform: "uppercase", marginBottom: 8 }}>
              Photo <span style={{ color: theme.textDim, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(recommended)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box", background: theme.surface2, border: `1px dashed ${image ? theme.accent : theme.border}`, borderRadius: 8, cursor: "pointer", overflow: "hidden", minHeight: image ? "auto" : 90 }}>
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              {image ? (
                <div style={{ position: "relative", width: "100%" }}>
                  <img src={image.previewUrl} alt="Plant" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />
                  <button onClick={e => { e.preventDefault(); setImage(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 14px", color: theme.textDim }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🌿</div>
                  <div style={{ fontSize: 13 }}>Tap to upload a photo</div>
                </div>
              )}
            </label>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: theme.accent, textTransform: "uppercase", marginBottom: 8 }}>
              Plant type <span style={{ color: theme.textDim, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input value={plantName} onChange={e => setPlantName(e.target.value)} placeholder="e.g. Monstera, Pothos..." style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border2}`, borderRadius: 8, padding: "11px 14px", color: theme.text, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: theme.accent, textTransform: "uppercase", marginBottom: 8 }}>
              Additional notes <span style={{ color: theme.textDim, fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(optional if photo uploaded)</span>
            </label>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Leaves turning yellow, soil stays wet..." rows={3} style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border2}`, borderRadius: 8, padding: "11px 14px", color: theme.text, fontSize: 15, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ color: theme.danger, fontSize: 14, marginBottom: 14 }}>{error}</div>}

          <button onClick={diagnose} disabled={loadingDiag || (!symptoms.trim() && !image)} style={{
            width: "100%", padding: "13px", borderRadius: 8,
            background: (symptoms.trim() || image) && !loadingDiag ? theme.accent : theme.surface2,
            color: (symptoms.trim() || image) && !loadingDiag ? theme.accentText : theme.textDim,
            border: "none", fontSize: 15, fontWeight: 600,
            cursor: (symptoms.trim() || image) && !loadingDiag ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 0.2s"
          }}>
            {loadingDiag ? "Examining your plant..." : "Diagnose"}
          </button>
        </div>
      )}

      {loadingDiag && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`, opacity: 0.6 }}/>)}
          <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
        </div>
      )}

      {result && sev && (
        <div style={{ maxWidth: 560, width: "calc(100% - 48px)", marginBottom: 48, animation: "fadeUp 0.4s ease" }}>
          <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }`}</style>

          {/* Diagnosis header */}
          <div style={{ background: theme.surface, border: `1px solid ${theme.border2}`, borderRadius: "16px 16px 0 0", padding: "20px 24px 16px", borderBottom: `1px solid ${theme.border2}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: theme.textDim, textTransform: "uppercase", marginBottom: 6 }}>Diagnosis</div>
                <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: theme.text, fontStyle: "italic", lineHeight: 1.2 }}>{result.diagnosis}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ background: sev.bg, border: `1px solid ${sev.color}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: sev.color, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {sev.label}
                </div>
                {result.confidence && (
                  <div style={{ fontSize: 11, color: theme.textDim }}>
                    {result.confidence}% confident
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ background: theme.surface2, border: `1px solid ${theme.border2}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "20px 24px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[{ label: "What's happening", value: result.whatsHappening }, { label: "Likely cause", value: result.likelyCause }].map(({ label, value }) => (
                <div key={label} style={{ background: theme.surface, borderRadius: 8, padding: "12px 14px", border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: theme.textDim, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.55 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Treatment checklist */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: theme.textDim, textTransform: "uppercase", marginBottom: 10 }}>Treatment</div>
              {result.treatment.map((step, i) => (
                <button key={i} onClick={() => toggleStep(i)} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  marginBottom: 10, padding: 0, fontFamily: "inherit"
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, border: `2px solid ${checkedSteps.includes(i) ? theme.accent : theme.border}`,
                    background: checkedSteps.includes(i) ? theme.accent : "transparent",
                    flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s"
                  }}>
                    {checkedSteps.includes(i) && <span style={{ color: theme.accentText, fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, color: checkedSteps.includes(i) ? theme.textDim : theme.textMuted, lineHeight: 1.5, textDecoration: checkedSteps.includes(i) ? "line-through" : "none" }}>{step}</span>
                </button>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${theme.border}`, margin: "16px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[{ label: "Prevention", value: result.prevention }, { label: "Prognosis", value: result.prognosis }].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: theme.textDim, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.55, fontStyle: "italic" }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Follow-up chat — Pro+ only */}
            <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: theme.textDim, textTransform: "uppercase", marginBottom: 12 }}>Ask a follow-up</div>
              {tier === "free" ? (
                <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>Follow-up chat is a Pro feature</div>
                  <button onClick={() => navigate("/pricing")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 6, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Upgrade to Pro</button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    {chatMessages.map((m, i) => (
                      <div key={i} style={{
                        alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                        background: m.role === "user" ? theme.accent : theme.surface,
                        color: m.role === "user" ? theme.accentText : theme.textMuted,
                        border: m.role === "assistant" ? `1px solid ${theme.border}` : "none",
                        borderRadius: 10, padding: "10px 14px", fontSize: 13, maxWidth: "85%", lineHeight: 1.5
                      }}>{m.content}</div>
                    ))}
                    {chatLoading && <div style={{ alignSelf: "flex-start", color: theme.textDim, fontSize: 13 }}>Thinking...</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Ask anything about this diagnosis..." style={{ flex: 1, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 12px", color: theme.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>→</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { setResult(null); setSymptoms(""); setPlantName(""); setImage(null); setCheckedSteps([]); setChatMessages([]); }} style={{ background: "none", border: "none", color: theme.textDim, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              Diagnose another plant
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto", padding: "0 24px 28px", textAlign: "center", color: theme.textDim, fontSize: 12 }}>
        Powered by AI · Not a substitute for professional horticultural advice
      </div>
    </div>
  );
}
