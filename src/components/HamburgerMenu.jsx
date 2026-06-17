import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { TIERS } from "../context/AuthContext";

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const tier = userData?.tier || "free";
  const tierInfo = TIERS[tier];

  const go = (path) => { setOpen(false); navigate(path); };
  const logout = async () => { await signOut(auth); navigate("/"); setOpen(false); };

  return (
    <>
      {/* Button */}
      <button onClick={() => setOpen(true)} style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 5, padding: 8
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 22, height: 2, background: "#7FD67A", borderRadius: 2 }} />
        ))}
      </button>

      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: 260,
        background: "#0E160E", borderRight: "1px solid #1A2A1A",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s ease", zIndex: 50,
        display: "flex", flexDirection: "column", padding: "24px 0"
      }}>
        {/* Header */}
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #1A2A1A" }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: "#E8F5E2", fontStyle: "italic", marginBottom: 4 }}>
            Plant Doctor
          </div>
          {user && (
            <div style={{ fontSize: 12, color: "#4A6B44", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
          )}
        </div>

        {/* Tier badge */}
        {userData && (
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #1A2A1A" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#6A9A62" }}>Current plan</span>
              <span style={{
                background: tier === "free" ? "#1E2E1E" : tier === "pro" ? "rgba(127,214,122,0.15)" : "rgba(255,209,102,0.15)",
                color: tier === "free" ? "#4A6B44" : tier === "pro" ? "#7FD67A" : "#FFD166",
                border: `1px solid ${tier === "free" ? "#2A4A2A" : tier === "pro" ? "#7FD67A" : "#FFD166"}`,
                borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600
              }}>
                {tierInfo.label}
              </span>
            </div>
            {tier !== "expert" && (
              <div style={{ fontSize: 11, color: "#3A5A3A", marginTop: 6 }}>
                {userData.diagnosesUsed}/{tierInfo.limit} diagnoses used this month
              </div>
            )}
          </div>
        )}

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 0" }}>
          {[
            { label: "🌿 Diagnose", path: "/diagnose" },
            { label: "💳 Pricing", path: "/pricing" },
            { label: "🏠 Home", path: "/" },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => go(path)} style={{
              width: "100%", background: "none", border: "none",
              color: "#C0D8B8", fontSize: 15, padding: "12px 20px",
              textAlign: "left", cursor: "pointer", fontFamily: "inherit",
              transition: "background 0.15s"
            }}
              onMouseEnter={e => e.target.style.background = "#111811"}
              onMouseLeave={e => e.target.style.background = "none"}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        {user && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1A2A1A" }}>
            <button onClick={logout} style={{
              width: "100%", background: "none", border: "1px solid #1A2A1A",
              color: "#4A6B44", fontSize: 14, padding: "10px",
              borderRadius: 8, cursor: "pointer", fontFamily: "inherit"
            }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
