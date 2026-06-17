import { useNavigate } from 'react-router-dom'

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

  return (
    <div style={{ background: "#0A0F0A", color: "#E0EFD8", fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid #111811" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#E8F5E2", fontStyle: "italic" }}>
          Plant Doctor
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => navigate('/pricing')} style={{ background: "none", border: "none", color: "#6A9A62", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
            Pricing
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: "#7FD67A", color: "#0A0F0A", border: "none",
            borderRadius: 8, padding: "9px 20px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 680, margin: "0 auto" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.25em", color: "#7FD67A", textTransform: "uppercase", marginBottom: 20, opacity: 0.8 }}>
          AI-powered plant diagnosis
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 8vw, 72px)",
          fontWeight: 400, lineHeight: 1.08, color: "#E8F5E2", marginBottom: 24,
          letterSpacing: "-0.02em"
        }}>
          Your plant is trying<br />
          <em>to tell you something.</em>
        </h1>
        <p style={{ fontSize: 17, color: "#8AAE82", lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
          Upload a photo of your sick plant and get an instant diagnosis — what's wrong, why it happened, and exactly how to fix it.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => navigate('/login')} style={{
            background: "#7FD67A", color: "#0A0F0A", border: "none",
            borderRadius: 10, padding: "15px 32px", fontSize: 16, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.01em"
          }}>
            Diagnose my plant →
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A6B44", fontSize: 14 }}>
            <span style={{ color: "#7FD67A" }}>✓</span> Free to sign up
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 800, margin: "0 auto 0", padding: "0 24px" }}>
        <div style={{ background: "#111811", border: "1px solid #1A2A1A", borderRadius: 14, padding: "24px 32px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#7FD67A", fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#4A6B44", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #111811", maxWidth: 800, margin: "48px auto 0" }} />

      {/* How it works */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>
          How it works
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {steps.map(s => (
            <div key={s.n} style={{ background: "#111811", border: "1px solid #1A2A1A", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: "#1E3020", fontWeight: 700, marginBottom: 16, lineHeight: 1 }}>
                {s.n}
              </div>
              <div style={{ fontSize: 16, color: "#E8F5E2", fontWeight: 600, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: "#6A9A62", lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #111811", maxWidth: 800, margin: "0 auto" }} />

      {/* Conditions ticker */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 24, textAlign: "center" }}>
          Conditions we detect
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {conditions.map(c => (
            <div key={c} style={{
              background: "#111811", border: "1px solid #1A2A1A", borderRadius: 20,
              padding: "6px 16px", fontSize: 13, color: "#8AAE82"
            }}>
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #111811", maxWidth: 800, margin: "0 auto" }} />

      {/* Testimonials */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "72px 24px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4A6B44", textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>
          What people are saying
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ background: "#111811", border: "1px solid #1A2A1A", borderRadius: 14, padding: "24px" }}>
              <div style={{ fontSize: 24, marginBottom: 14 }}>{t.plant}</div>
              <p style={{ fontSize: 14, color: "#C0D8B8", lineHeight: 1.65, marginBottom: 16, fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ fontSize: 13, color: "#E8F5E2", fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#4A6B44" }}>{t.handle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "48px 24px 80px", borderTop: "1px solid #111811", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, color: "#E8F5E2", marginBottom: 16 }}>
          Is your plant trying to survive?
        </h2>
        <p style={{ color: "#6A9A62", fontSize: 15, marginBottom: 32 }}>Find out in seconds. 3 free diagnoses to start.</p>
        <button onClick={() => navigate('/login')} style={{
          background: "#7FD67A", color: "#0A0F0A", border: "none",
          borderRadius: 10, padding: "15px 36px", fontSize: 16, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit"
        }}>
          Diagnose my plant →
        </button>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #0E160E", padding: "24px", textAlign: "center", color: "#1E3020", fontSize: 12 }}>
        Plant Doctor · AI-powered · Not a substitute for professional horticultural advice
      </div>
    </div>
  )
}