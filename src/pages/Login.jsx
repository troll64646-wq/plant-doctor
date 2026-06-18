import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async () => {
    setError(null); setLoading(true);
    try {
      if (isSignup) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      navigate("/diagnose");
    } catch (e) {
      setError(e.message.replace("Firebase: ", "").replace(/\(auth.*\)\.?/, "").trim());
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/diagnose");
    } catch (e) {
      setError(e.message.replace("Firebase: ", "").trim());
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 32, color: theme.text, fontStyle: "italic", marginBottom: 8 }}>Plant Doctor</div>
          <div style={{ fontSize: 14, color: theme.textDim }}>{isSignup ? "Create your account" : "Welcome back"}</div>
        </div>

        <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: "28px 24px" }}>
          <button onClick={handleGoogle} style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
            <span style={{ fontSize: 12, color: theme.textDim }}>or</span>
            <div style={{ flex: 1, height: 1, background: theme.border }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "11px 14px", color: theme.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ width: "100%", background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: 8, padding: "11px 14px", color: theme.text, fontSize: 15, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ color: theme.danger, fontSize: 13, marginBottom: 14 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: theme.accent, color: theme.accentText, border: "none", borderRadius: 8, padding: "13px", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : isSignup ? "Create account" : "Sign in"}
          </button>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => setIsSignup(!isSignup)} style={{ background: "none", border: "none", color: theme.textDim, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
              {isSignup ? "Already have an account? Sign in" : "No account? Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
