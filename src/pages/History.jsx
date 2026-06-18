import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";

const SEV_COLOR = { low: "#7FD67A", medium: "#FFD166", high: "#EF6351" };

export default function History() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const q = query(collection(db, "users", user.uid, "diagnoses"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setDiagnoses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setFetching(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }} />;
  if (!user) return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <p style={{ color: theme.textMuted }}>Sign in to view your history</p>
      <button onClick={() => navigate("/login")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Sign in</button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, background: theme.bg, zIndex: 10 }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: theme.text, fontStyle: "italic" }}>Diagnosis History</div>
        <div style={{ width: 40 }} />
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        {fetching ? (
          <div style={{ textAlign: "center", color: theme.textDim, marginTop: 60 }}>Loading...</div>
        ) : diagnoses.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
            <div style={{ color: theme.textMuted, fontSize: 16, marginBottom: 24 }}>No diagnoses yet</div>
            <button onClick={() => navigate("/diagnose")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Diagnose your first plant
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {diagnoses.map(d => (
              <div key={d.id} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, overflow: "hidden" }}>
                <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={{
                  width: "100%", background: "none", border: "none", padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "'Georgia', serif", fontSize: 16, color: theme.text, fontStyle: "italic" }}>{d.diagnosis}</div>
                    <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>
                      {d.plantName || "Unknown plant"} · {new Date(d.timestamp?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEV_COLOR[d.severity] || "#7FD67A" }} />
                    <span style={{ color: theme.textDim, fontSize: 18 }}>{expanded === d.id ? "↑" : "↓"}</span>
                  </div>
                </button>

                {expanded === d.id && (
                  <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${theme.border}` }}>
                    <div style={{ paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      {[{ label: "What happened", val: d.whatsHappening }, { label: "Cause", val: d.likelyCause }].map(({ label, val }) => (
                        <div key={label} style={{ background: theme.surface2, borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 10, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: theme.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>Treatment</div>
                    {d.treatment?.map((t, i) => (
                      <div key={i} style={{ fontSize: 13, color: theme.textMuted, marginBottom: 6, display: "flex", gap: 8 }}>
                        <span style={{ color: theme.accent }}>·</span> {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
