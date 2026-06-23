import { useNavigate } from "react-router-dom";
import { useAuth, TIERS } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import HamburgerMenu from "../components/HamburgerMenu";

const PLANS = [
  { key: "free", name: "Free", price: "$0", period: "forever", features: ["3 diagnoses per month", "Photo + text input", "Full diagnosis report", "Treatment checklist"], cta: "Get started", highlight: false },
  { key: "pro", name: "Pro", price: "$4.99", period: "per month", features: ["30 diagnoses per month", "Photo + text input", "Full diagnosis report", "Treatment checklist", "Diagnosis history", "Plant profiles"], cta: "Get Pro", highlight: true },
  { key: "expert", name: "Expert", price: "$9.99", period: "per month", features: ["Unlimited diagnoses", "Everything in Pro", "Priority support", "Early access to new features"], cta: "Get Expert", highlight: false },
];

const LEMONSQUEEZY_URLS = {
  pro: "https://plant-doctor.lemonsqueezy.com/checkout/buy/71d71e93-cf6a-4a4d-af83-efd24b166f39",
  expert: "https://plant-doctor.lemonsqueezy.com/checkout/buy/a5e6c962-42b0-4ece-a0fd-a59863098a7b",
};

export default function Pricing() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { theme } = useTheme();
  const currentTier = userData?.tier || "free";

  const handleCta = (plan) => {
    if (plan.key === "free") { navigate(user ? "/diagnose" : "/login"); return; }
    if (!user) { navigate("/login"); return; }
    const base = plan.key === "pro" ? LEMONSQUEEZY_URLS.pro : LEMONSQUEEZY_URLS.expert;
    const url = `${base}?checkout[custom][uid]=${user.uid}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}` }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: theme.text, fontStyle: "italic" }}>Plant Doctor</div>
        <div style={{ width: 40 }} />
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: theme.accent, textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 400, color: theme.text, marginBottom: 14 }}>
            Simple, honest pricing
          </h1>
          <p style={{ color: theme.textMuted, fontSize: 16 }}>Start free. Upgrade when your plants need more attention.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{
              background: plan.highlight ? theme.surface2 : theme.surface,
              border: `1px solid ${plan.highlight ? theme.accent : theme.border}`,
              borderRadius: 16, padding: "28px 24px", position: "relative", display: "flex", flexDirection: "column"
            }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: theme.accent, color: theme.accentText, fontSize: 11, fontWeight: 700, padding: "3px 14px", borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Most popular</div>
              )}
              {currentTier === plan.key && (
                <div style={{ fontSize: 11, color: theme.accent, marginBottom: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>✓ Current plan</div>
              )}
              <div style={{ fontSize: 18, color: theme.text, fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: "'Georgia', serif", fontSize: 36, color: theme.text }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: theme.textDim, marginLeft: 6 }}>{plan.period}</span>
              </div>
              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 14, color: theme.textMuted }}>
                    <span style={{ color: theme.accent, flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => handleCta(plan)} disabled={currentTier === plan.key} style={{
                width: "100%", padding: "12px",
                background: currentTier === plan.key ? "transparent" : plan.highlight ? theme.accent : "transparent",
                color: currentTier === plan.key ? theme.textDim : plan.highlight ? theme.accentText : theme.accent,
                border: `1px solid ${plan.highlight ? theme.accent : theme.border}`,
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: currentTier === plan.key ? "default" : "pointer", fontFamily: "inherit"
              }}>
                {currentTier === plan.key ? "Current plan" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
