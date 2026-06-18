import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth, TIERS } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { theme, mode, toggle } = useTheme();
  const tier = userData?.tier || "free";
  const tierInfo = TIERS[tier];

  const go = (path) => { setOpen(false); navigate(path); };
  const logout = async () => { await signOut(auth); navigate("/"); setOpen(false); };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 8 }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: theme.accent, borderRadius: 2 }} />)}
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}

      <div style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: 270,
        background: theme.surface, borderRight: `1px solid ${theme.border}`,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease", zIndex: 50,
        display: "flex", flexDirection: "column", padding: "24px 0",
        fontFamily: "'Inter', system-ui, sans-serif"
      }}>
        {/* Header */}
        <div style={{ padding: "0 20px 20px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: theme.text, fontStyle: "italic", marginBottom: 4 }}>Plant Doctor</div>
          {user && <div style={{ fontSize: 12, color: theme.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>}
        </div>

        {/* Tier badge */}
        {userData && (
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: theme.textMuted }}>Current plan</span>
              <span style={{
                background: tier === "free" ? "transparent" : tier === "pro" ? "rgba(127,214,122,0.15)" : "rgba(255,209,102,0.15)",
                color: tier === "free" ? theme.textDim : tier === "pro" ? theme.accent : theme.warning,
                border: `1px solid ${tier === "free" ? theme.border : tier === "pro" ? theme.accent : theme.warning}`,
                borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600
              }}>{tierInfo.label}</span>
            </div>
            {tier !== "expert" && (
              <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>
                {userData.diagnosesUsed}/{tierInfo.limit} diagnoses used this month
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {[
            { label: "🌿  Diagnose", path: "/diagnose" },
            { label: "📋  History", path: "/history" },
            { label: "🪴  My Plants", path: "/plants" },
            { label: "💳  Pricing", path: "/pricing" },
            { label: "🏠  Home", path: "/" },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => go(path)} style={{
              width: "100%", background: "none", border: "none",
              color: theme.textMuted, fontSize: 15, padding: "12px 20px",
              textAlign: "left", cursor: "pointer", fontFamily: "inherit",
            }}>
              {label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${theme.border}` }}>
          <button onClick={toggle} style={{
            width: "100%", background: theme.surface2, border: `1px solid ${theme.border}`,
            color: theme.textMuted, fontSize: 14, padding: "10px",
            borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8
          }}>
            {mode === "dark" ? "☀️  Light mode" : "🌙  Dark mode"}
          </button>
        </div>

        {/* Logout */}
        {user && (
          <div style={{ padding: "8px 20px 0" }}>
            <button onClick={logout} style={{
              width: "100%", background: "none", border: `1px solid ${theme.border}`,
              color: theme.textDim, fontSize: 14, padding: "10px",
              borderRadius: 8, cursor: "pointer", fontFamily: "inherit"
            }}>Sign out</button>
          </div>
        )}
      </div>
    </>
  );
}
