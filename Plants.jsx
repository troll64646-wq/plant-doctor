import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import HamburgerMenu from "../components/HamburgerMenu";

export default function Plants() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [waterDays, setWaterDays] = useState(7);
  const [saving, setSaving] = useState(false);

  const fetchPlants = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, "users", user.uid, "plants"));
    setPlants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setFetching(false);
  };

  useEffect(() => { fetchPlants(); }, [user]);

  const addPlant = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await addDoc(collection(db, "users", user.uid, "plants"), {
      name, type, notes, waterDays: parseInt(waterDays),
      lastWatered: null, createdAt: serverTimestamp()
    });
    setName(""); setType(""); setNotes(""); setWaterDays(7); setAdding(false);
    await fetchPlants();
    setSaving(false);
  };

  const deletePlant = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "plants", id));
    setPlants(p => p.filter(x => x.id !== id));
  };

  const waterPlant = async (id) => {
    const { updateDoc, doc: fDoc, serverTimestamp: sTs } = await import("firebase/firestore");
    await updateDoc(fDoc(db, "users", user.uid, "plants", id), { lastWatered: sTs() });
    setPlants(p => p.map(x => x.id === id ? { ...x, lastWatered: { seconds: Date.now() / 1000 } } : x));
  };

  const daysUntilWater = (plant) => {
    if (!plant.lastWatered) return 0;
    const last = new Date(plant.lastWatered.seconds * 1000);
    const next = new Date(last.getTime() + plant.waterDays * 86400000);
    const diff = Math.ceil((next - new Date()) / 86400000);
    return diff;
  };

  if (loading) return <div style={{ minHeight: "100vh", background: theme.bg }} />;
  if (!user) return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "Inter, system-ui, sans-serif" }}>
      <p style={{ color: theme.textMuted }}>Sign in to manage your plants</p>
      <button onClick={() => navigate("/login")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Sign in</button>
    </div>
  );

  const tier = userData?.tier || "free";
  if (tier === "free") return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, background: theme.bg, zIndex: 10 }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: theme.text, fontStyle: "italic" }}>My Plants</div>
        <div style={{ width: 40 }} />
      </nav>
      <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🪴</div>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: theme.text, marginBottom: 12 }}>Pro feature</div>
        <div style={{ fontSize: 15, color: theme.textMuted, marginBottom: 28, lineHeight: 1.7 }}>Plant profiles and watering reminders are available on Pro and Expert plans. Upgrade to track all your plants.</div>
        <button onClick={() => navigate("/pricing")} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "13px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>See plans →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, background: theme.bg, zIndex: 10 }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: theme.text, fontStyle: "italic" }}>My Plants</div>
        <button onClick={() => setAdding(true)} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add</button>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>

        {/* Add plant modal */}
        {adding && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: theme.text, marginBottom: 20 }}>Add a plant</div>
              {[
                { label: "Name *", val: name, set: setName, placeholder: "e.g. Planty" },
                { label: "Type", val: type, set: setType, placeholder: "e.g. Monstera" },
                { label: "Notes", val: notes, set: setNotes, placeholder: "Any notes about this plant" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "10px 12px", color: theme.text, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Water every {waterDays} days</label>
                <input type="range" min={1} max={30} value={waterDays} onChange={e => setWaterDays(e.target.value)} style={{ width: "100%", accentColor: theme.accent }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setAdding(false)} style={{ flex: 1, background: "none", border: `1px solid ${theme.border}`, color: theme.textDim, borderRadius: 8, padding: "11px", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Cancel</button>
                <button onClick={addPlant} disabled={saving || !name.trim()} style={{ flex: 1, background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
                  {saving ? "Saving..." : "Add plant"}
                </button>
              </div>
            </div>
          </div>
        )}

        {fetching ? (
          <div style={{ textAlign: "center", color: theme.textDim, marginTop: 60 }}>Loading...</div>
        ) : plants.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 80 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🪴</div>
            <div style={{ color: theme.textMuted, fontSize: 16, marginBottom: 24 }}>No plants yet</div>
            <button onClick={() => setAdding(true)} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Add your first plant
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {plants.map(p => {
              const days = daysUntilWater(p);
              const urgent = days <= 1;
              return (
                <div key={p.id} style={{ background: theme.surface, border: `1px solid ${urgent ? theme.warning : theme.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 17, color: theme.text, fontWeight: 600 }}>{p.name}</div>
                      {p.type && <div style={{ fontSize: 13, color: theme.textDim, marginTop: 2 }}>{p.type}</div>}
                    </div>
                    <button onClick={() => deletePlant(p.id)} style={{ background: "none", border: "none", color: theme.textDim, cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>

                  {p.notes && <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12, fontStyle: "italic" }}>{p.notes}</div>}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: urgent ? theme.warning : theme.textDim }}>
                      💧 {p.lastWatered
                        ? days <= 0 ? "Water today!" : days === 1 ? "Water tomorrow" : `Water in ${days} days`
                        : "Not watered yet"}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => waterPlant(p.id)} style={{ background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.accent, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                        💧 Watered
                      </button>
                      <button onClick={() => navigate("/diagnose")} style={{ background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                        🔍 Diagnose
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
