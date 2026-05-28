import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AnimatePresence, motion } from "framer-motion";

// ─── Design tokens extracted from Figma ─────────────────────────────────────
// Background: #FEF9F9  |  Button: #F05578  |  Input bg: #FFFFFF
// Input border: #F2DADE  |  Label: #1A1A2E  |  Placeholder: #C4A7AB
// Subtitle: #9E8A8C  |  Link: #F05578

// ─── Shared primitives ───────────────────────────────────────────────────────

const CORAL = "#F05578";

function FieldLabel({ children }) {
    return (
        <p style={{ color: "#1A1A2E", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
            {children}
        </p>
    );
}

function TextInput({ type = "text", placeholder, value, onChange, name }) {
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            autoComplete={name}
            style={{
                width: "100%",
                background: "#FFFFFF",
                border: "1.4px solid #F2DADE",
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "14px",
                color: "#1A1A2E",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = CORAL}
            onBlur={(e) => e.target.style.borderColor = "#F2DADE"}
            className="auth-input"
        />
    );
}

function CoralButton({ children, onClick, type = "button", loading = false, disabled = false, outline = false }) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            style={{
                width: "100%",
                background: outline ? "transparent" : CORAL,
                color: outline ? CORAL : "#FFFFFF",
                border: outline ? `2px solid ${CORAL}` : "none",
                borderRadius: "50px",
                padding: "17px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                opacity: loading || disabled ? 0.5 : 1,
                transition: "opacity 0.2s, transform 0.1s",
                boxShadow: outline ? "none" : "0 8px 24px rgba(240,85,120,0.30)",
                letterSpacing: "0.3px",
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
            {loading ? "Please wait..." : children}
        </button>
    );
}

function ErrorMsg({ msg }) {
    if (!msg) return null;
    return (
        <p style={{ color: "#E53E3E", background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" }}>
            {msg}
        </p>
    );
}

function SuccessMsg({ msg }) {
    if (!msg) return null;
    return (
        <p style={{ color: "#276749", background: "#F0FFF4", border: "1px solid #C6F6D5", borderRadius: "10px", padding: "10px 14px", fontSize: "13px" }}>
            {msg}
        </p>
    );
}

function BackArrow({ onClick }) {
    return (
        <button
            onClick={onClick}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginBottom: "24px", color: "#1A1A2E" }}
        >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
            </svg>
        </button>
    );
}

function StatusBar() {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 0", fontSize: "12px", fontWeight: 600, color: "#1A1A2E" }}>
            <span>9:41</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span>●●</span>
                <span>□</span>
            </div>
        </div>
    );
}

// ─── Sign In Screen ───────────────────────────────────────────────────────────
function SignInScreen({ onGoSignUp, onGoForgot, onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (err) setError(err.message);
        else onSuccess();
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A2E", marginBottom: "8px", lineHeight: 1.2 }}>
                    Welcome back
                </h1>
                <p style={{ fontSize: "14px", color: "#9E8A8C", lineHeight: 1.5 }}>
                    Sign in to continue tracking your health.
                </p>
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
                <div>
                    <FieldLabel>Email Address</FieldLabel>
                    <TextInput name="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div>
                    <FieldLabel>Password</FieldLabel>
                    <TextInput name="current-password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} />
                    <div style={{ textAlign: "right", marginTop: "8px" }}>
                        <button type="button" onClick={onGoForgot}
                            style={{ background: "none", border: "none", cursor: "pointer", color: CORAL, fontSize: "13px", fontWeight: 600 }}>
                            Forgot password?
                        </button>
                    </div>
                </div>

                <ErrorMsg msg={error} />

                <div style={{ flex: 1, minHeight: "24px" }} />

                <CoralButton type="submit" loading={loading}>Sign In</CoralButton>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#9E8A8C", marginTop: "4px" }}>
                    Don't have an account?{" "}
                    <button type="button" onClick={onGoSignUp}
                        style={{ background: "none", border: "none", cursor: "pointer", color: CORAL, fontWeight: 700, fontSize: "13px" }}>
                        Sign up
                    </button>
                </p>
            </form>
        </div>
    );
}

// ─── Create Account Screen ────────────────────────────────────────────────────
function CreateAccountScreen({ onGoSignIn, onSuccess }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handle = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setLoading(true);
        const { error: err } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName, expected_due_date: dueDate } },
        });
        setLoading(false);
        if (err) setError(err.message);
        else onSuccess();
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A2E", marginBottom: "8px", lineHeight: 1.2 }}>
                    Create Account
                </h1>
                <p style={{ fontSize: "14px", color: "#9E8A8C", lineHeight: 1.5 }}>
                    Join MatriGluco to start your healthy journey.
                </p>
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
                <div>
                    <FieldLabel>Full Name</FieldLabel>
                    <TextInput name="name" placeholder="Sarah Johnson" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>Email Address</FieldLabel>
                    <TextInput name="email" type="email" placeholder="sarah@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>Password</FieldLabel>
                    <TextInput name="new-password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div>
                    <FieldLabel>Expected Due Date</FieldLabel>
                    <TextInput name="due-date" type="date" placeholder="" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>

                <ErrorMsg msg={error} />

                <div style={{ flex: 1, minHeight: "8px" }} />

                <CoralButton type="submit" loading={loading}>Create Account</CoralButton>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#9E8A8C" }}>
                    Already have an account?{" "}
                    <button type="button" onClick={onGoSignIn}
                        style={{ background: "none", border: "none", cursor: "pointer", color: CORAL, fontWeight: 700, fontSize: "13px" }}>
                        Sign in
                    </button>
                </p>
            </form>
        </div>
    );
}

// ─── Reset Password Screen ────────────────────────────────────────────────────
function ResetPasswordScreen({ onBack }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handle = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        setLoading(true);
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth`,
        });
        setLoading(false);
        if (err) setError(err.message);
        else setSuccess("Reset link sent! Check your inbox.");
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <BackArrow onClick={onBack} />
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A2E", marginBottom: "12px", lineHeight: 1.2 }}>
                    Reset Password
                </h1>
                <p style={{ fontSize: "14px", color: "#9E8A8C", lineHeight: 1.6 }}>
                    Enter the email associated with your account and we'll send an email with instructions to reset your password.
                </p>
            </div>

            <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: "18px", flex: 1 }}>
                <div>
                    <FieldLabel>Email Address</FieldLabel>
                    <TextInput name="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <ErrorMsg msg={error} />
                <SuccessMsg msg={success} />

                <div style={{ flex: 1 }} />

                <CoralButton type="submit" loading={loading} outline={!!success}>
                    Send Reset Link
                </CoralButton>
            </form>
        </div>
    );
}

// ─── Verify Email Screen ──────────────────────────────────────────────────────
function VerifyEmailScreen({ onGoSignIn }) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputs = useRef([]);

    const handleChange = (val, idx) => {
        const next = [...code];
        next[idx] = val.slice(-1);
        setCode(next);
        if (val && idx < 5) inputs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && !code[idx] && idx > 0) {
            inputs.current[idx - 1]?.focus();
        }
    };

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <BackArrow onClick={onGoSignIn} />
            <div style={{ marginBottom: "40px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#1A1A2E", marginBottom: "12px", lineHeight: 1.2 }}>
                    Verify Email
                </h1>
                <p style={{ fontSize: "14px", color: "#9E8A8C", lineHeight: 1.6 }}>
                    We've sent a 6-digit verification code to your email address.
                </p>
            </div>

            {/* 6-digit OTP boxes */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "32px" }}>
                {code.map((digit, idx) => (
                    <input
                        key={idx}
                        ref={el => inputs.current[idx] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(e.target.value, idx)}
                        onKeyDown={e => handleKeyDown(e, idx)}
                        style={{
                            width: "44px",
                            height: "52px",
                            background: "#FFFFFF",
                            border: digit ? `2px solid ${CORAL}` : "1.5px solid #F2DADE",
                            borderRadius: "12px",
                            textAlign: "center",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#1A1A2E",
                            outline: "none",
                            transition: "border-color 0.2s",
                        }}
                    />
                ))}
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <CoralButton onClick={onGoSignIn} outline>Verify Account</CoralButton>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#9E8A8C" }}>
                    Didn't receive the code?{" "}
                    <span style={{ color: CORAL, fontWeight: 700, cursor: "pointer" }}>Resend in 0:20</span>
                </p>
            </div>
        </div>
    );
}

// ─── Root Auth Component ──────────────────────────────────────────────────────
export default function Auth() {
    const navigate = useNavigate();
    const [screen, setScreen] = useState("signin"); // signin | signup | verify | forgot

    const slide = {
        initial: { opacity: 0, x: 24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { duration: 0.22, ease: "easeInOut" },
    };

    return (
        <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Mobile phone container — centered on desktop */}
            <div
                style={{
                    width: "100%",
                    maxWidth: "100%",
                    minHeight: "844px",
                    background: "#FEF9F9",
                    borderRadius: "40px",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    position: "relative",
                }}
                // On small screens, full height no rounding
                className="auth-phone-container"
            >
                <StatusBar />

                {/* Content area */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 28px 36px", overflow: "hidden" }}>
                    <AnimatePresence mode="wait">
                        {screen === "signin" && (
                            <motion.div key="signin" {...slide} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <SignInScreen
                                    onGoSignUp={() => setScreen("signup")}
                                    onGoForgot={() => setScreen("forgot")}
                                    onSuccess={() => navigate("/")}
                                />
                            </motion.div>
                        )}
                        {screen === "signup" && (
                            <motion.div key="signup" {...slide} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <BackArrow onClick={() => setScreen("signin")} />
                                <CreateAccountScreen
                                    onGoSignIn={() => setScreen("signin")}
                                    onSuccess={() => setScreen("verify")}
                                />
                            </motion.div>
                        )}
                        {screen === "verify" && (
                            <motion.div key="verify" {...slide} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <VerifyEmailScreen onGoSignIn={() => setScreen("signin")} />
                            </motion.div>
                        )}
                        {screen === "forgot" && (
                            <motion.div key="forgot" {...slide} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                <ResetPasswordScreen onBack={() => setScreen("signin")} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Home indicator */}
                <div style={{ display: "flex", justifyContent: "center", paddingBottom: "12px" }}>
                    <div style={{ width: "120px", height: "4px", background: "#1A1A2E", borderRadius: "10px", opacity: 0.15 }} />
                </div>
            </div>

            {/* Responsive: full-screen on very small screens */}
            <style>{`
                @media (max-width: 430px) {
                    .auth-phone-container {
                        border-radius: 0 !important;
                        min-height: 100vh !important;
                        box-shadow: none !important;
                    }
                }
            `}</style>
        </div>
    );
}