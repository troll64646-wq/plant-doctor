import { useNavigate } from "react-router-dom";
import { useAuth, TIERS } from "../context/AuthContext";
import HamburgerMenu from "../components/HamburgerMenu";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["3 diagnoses per month", "Photo + text input", "Full diagnosis report"],
    cta: "Get started",
    ctaAction: "signup",
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$4.99",
    period: "per month",
    features: ["30 diagnoses per month", "Photo + text input", "Full diagnosis report", "Priority support"],
    cta: "Get Pro",
    ctaAction: "lemonsqueezy_pro",
    highlight: true,
  },
  {
    key: "expert",
    name: "Expert",
    price: "$9.99",
    period: "per month",
    features: ["Unlimited diagnoses", "Photo + text input", "Full diagnosis report", "Priority support", "Early access to new features"],
    cta: "Get Expert",
    ctaAction: "lemonsqueezy_expert",
    highlight: false,
  },
];

// Replace these with your LemonSqueezy checkout URLs
const LEMONSQUEEZY_URLS = {
  pro: "https://YOUR_STORE.lemonsqueezy.com/checkout/buy/PRO_PRODUCT_ID",
  expert: "https://YOUR_STORE.lemonsqueezy.com/checkout/buy/EXPERT_PRODUCT_ID",
};

export default function Pricing() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const currentTier = userData?.tier || "free";

  const handleCta = (plan) => {
    if (plan.ctaAction === "signup") { navigate(user ? "/diagnose" : "/login"); return; }
    const url = plan.key === "pro" ? LEMONSQUEEZY_URLS.pro : LEMONSQUEEZY_URLS.expert;
    window.open(url, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0F0A", color: "#E0EFD8", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #111811" }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 18, color: "#E8F5E2", fontStyle: "italic" }}>Plant Doctor</div>
        <div style={{ width: 40 }} />
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
          <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 400, color: "#E8F5E2", marginBottom: 14 }}>
            Simple, honest pricing
          </h1>
          <p style={{ color: "#6A9A62", fontSize: 16 }}>Start free. Upgrade when your plants need more attention.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{
              background: plan.highlight ? "#121E12" : "#111811",
              border: `1px solid ${plan.highlight ? "#7FD67A" : "#1A2A1A"}`,
              borderRadius: 16, padding: "28px 24px",
              position: "relative", display: "flex", flexDirection: "column"
            }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "#7FD67A", color: "#0A0F0A", fontSize: 11,
                  fontWeight: 700, padding: "3px 14px", borderRadius: 20,
                  letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap"
                }}>Most popular</div>
              )}

              {currentTier === plan.key && (
                <div style={{ fontSize: 11, color: "#7FD67A", marginBottom: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  ✓ Current plan
                </div>
              )}

              <div style={{ fontSize: 18, color: "#E8F5E2", fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: "'Georgia', serif", fontSize: 36, color: "#E8F5E2" }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: "#4A6B44", marginLeft: 6 }}>{plan.period}</span>
              </div>

              <div style={{ flex: 1, marginBottom: 24 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 14, color: "#8AAE82" }}>
                    <span style={{ color: "#7FD67A", flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>

              <button onClick={() => handleCta(plan)} disabled={currentTier === plan.key} style={{
                width: "100%", padding: "12px",
                background: currentTier === plan.key ? "#1A2A1A" : plan.highlight ? "#7FD67A" : "#1A2A1A",
                color: currentTier === plan.key ? "#3A5A3A" : plan.highlight ? "#0A0F0A" : "#7FD67A",
                border: `1px solid ${plan.highlight ? "#7FD67A" : "#2A4A2A"}`,
                borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: currentTier === plan.key ? "default" : "pointer",
                fontFamily: "inherit"
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
