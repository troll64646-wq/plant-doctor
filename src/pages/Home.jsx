import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import HamburgerMenu from '../components/HamburgerMenu'

const testimonials = [
  { name: "Sofia M.", handle: "@sofiasgarden", text: "My pothos was basically dead. Uploaded a photo and found out it had root rot — the fix worked in a week.", plant: "🪴" },
  { name: "James K.", handle: "@jkplants", text: "Finally an app that actually tells me WHAT is wrong and HOW to fix it, not just 'water it more'.", plant: "🌿" },
  { name: "Priya N.", handle: "@priyagreens", text: "Saved my fiddle leaf fig that three other apps couldn't diagnose. This is witchcraft.", plant: "🌱" },
]

const steps = [
  { n: "01", title: "Upload a photo", desc: "Take a photo of your sick plant. No typing needed." },
  { n: "02", title: "AI examines it", desc: "Our model identifies the exact condition affecting your plant." },
  { n: "03", title: "Get the fix", desc: "Receive a diagnosis, cause, and step-by-step treatment plan." },
]

const stats = [
  { value: "10K+", label: "Plants diagnosed" },
  { value: "94%", label: "Accuracy rate" },
  { value: "30s", label: "Average diagnosis time" },
]

const conditions = ["Root rot", "Overwatering", "Nutrient deficiency", "Leaf blight", "Spider mites", "Sunburn", "Fungal infection", "Underwatering"]

export default function Home() {
  const navigate = useNavigate()
  const { theme } = useTheme()

  return (
    <div style={{ background: theme.bg, color: theme.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: `1px solid ${theme.border}` }}>
        <HamburgerMenu />
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: theme.text, fontStyle: "italic" }}>Plant Doctor</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => navigate('/pricing')} style={{ background: "none", border: "none", color: theme.textMuted, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Pricing</button>
          <button onClick={() => navigate('/login')} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Get started</button>
        </div>
      </nav>

      <div style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.25em", color: theme.accent, textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>AI-powered plant diagnosis</div>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(42px, 8vw, 72px)", fontWeight: 400, lineHeight: 1.08, color: theme.text, marginBottom: 24, letterSpacing: "-0.02em" }}>
          Your plant is trying<br /><em>to tell you something.</em>
        </h1>
        <p style={{ fontSize: 17, color: theme.textMuted, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px" }}>
          Upload a photo of your sick plant and get an instant diagnosis — what's wrong, why it happened, and exactly how to fix it.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate('/login')} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 10, padding: "15px 32px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Diagnose my plant →
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.textDim, fontSize: 14 }}>
            <span style={{ color: theme.accent }}>✓</span> Free to sign up
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 800, margin: "0 auto 0", padding: "0 24px" }}>
        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "24px 32px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 28, color: theme.accent, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: theme.textDim, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 800, margin: "48px auto 0" }} />

      {/* How it works */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.textDim, textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {steps.map(s => (
            <div key={s.n} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 36, color: theme.border, fontWeight: 700, marginBottom: 16, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 16, color: theme.text, fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 800, margin: "0 auto" }} />

      {/* Conditions */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.textDim, textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>Conditions we detect</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {conditions.map(c => (
            <div key={c} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 20, padding: "6px 16px", fontSize: 13, color: theme.textMuted }}>{c}</div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, maxWidth: 800, margin: "0 auto" }} />

      {/* Testimonials */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: theme.textDim, textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>What people are saying</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, padding: "24px" }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{t.plant}</div>
              <p style={{ fontSize: 14, color: theme.textMuted, lineHeight: 1.65, marginBottom: 16, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: theme.textDim }}>{t.handle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "48px 24px 80px", borderTop: `1px solid ${theme.border}`, maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, color: theme.text, marginBottom: 16 }}>Is your plant trying to survive?</h2>
        <p style={{ color: theme.textMuted, fontSize: 15, marginBottom: 32 }}>Find out in seconds. 3 free diagnoses to start.</p>
        <button onClick={() => navigate('/login')} style={{ background: theme.accent, color: theme.accentText, border: "none", borderRadius: 10, padding: "15px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Diagnose my plant →
        </button>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, padding: "24px", textAlign: "center", color: theme.textDim, fontSize: 12 }}>
        Plant Doctor · AI-powered · Not a substitute for professional horticultural advice
      </div>
    </div>
  )
}
