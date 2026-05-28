import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

/* ─── Exact color tokens from Figma screenshots ────────────────────────────── */
const C = {
    bg: "#F9F3F3",
    white: "#FFFFFF",
    textDark: "#1A1A2E",
    textMid: "#6B6B80",
    textLight: "#A0A0B0",
    coral: "#F47C7C",
    coralLight: "#FEE8E8",
    green: "#4E7D68",
    greenLight: "#E6F4EE",
    greenText: "#3D7A5E",
    amber: "#F5A623",
    amberLight: "#FEF3DC",
    border: "#F0E8E8",
    shadow: "0 2px 16px rgba(0,0,0,0.06)",
};

/* ─── Greeting based on time ─────────────────────────────────────────────── */
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning,";
    if (h < 17) return "Good afternoon,";
    return "Good evening,";
}

/* ─── Risk config ──────────────────────────────────────────────────────── */
function getRiskConfig(level = "") {
    const l = level.toLowerCase();
    if (l.includes("high")) return { bg: C.coralLight, text: C.coral, label: "High" };
    if (l.includes("moderate")) return { bg: C.amberLight, text: C.amber, label: "Moderate" };
    return { bg: C.greenLight, text: C.greenText, label: "Low" };
}

/* ─── Health tip based on risk ──────────────────────────────────────────── */
function getHealthTip(level = "") {
    const l = level.toLowerCase();
    if (l.includes("high"))
        return "Please consult your doctor soon. Avoid high‑glycemic foods and monitor your glucose daily.";
    if (l.includes("moderate"))
        return "Watch your carb intake and exercise regularly. Aim for 30‑minute walks and limit sugary drinks.";
    return "Drinking a glass of water before meals can help stabilize blood sugar levels during your second trimester.";
}

/* ─── Pregnancy week & trimester ────────────────────────────────────────── */
function getPregnancyInfo(dueDateStr) {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();

    // Total duration of pregnancy is approx 280 days (40 weeks)
    const diffDays = Math.max(0, Math.round((due - today) / (1000 * 60 * 60 * 24)));
    const totalWeeks = 40;

    // Current week = 40 - (days_left / 7)
    // We use Math.max(1, ...) to avoid Week 0
    let week = totalWeeks - Math.floor(diffDays / 7);
    week = Math.max(1, Math.min(40, week));

    let trimester = "1st";
    if (week >= 14 && week <= 27) trimester = "2nd";
    else if (week >= 28) trimester = "3rd";

    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return { week, trimester, dueDate: fmt(due) };
}

/* ─── Sub‑components ─────────────────────────────────────────────────────── */
function IconBox({ bg, children }) {
    return (
        <div
            style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
            }}
        >
            {children}
        </div>
    );
}

function QuickCard({ onClick, iconBg, icon, label, sub }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 20,
                padding: "20px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                boxShadow: C.shadow,
                transition: "transform 0.15s",
                width: "100%",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            <IconBox bg={iconBg}>{icon}</IconBox>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textDark, textAlign: "center" }}>
                {label}
            </span>
            <span style={{ fontSize: 12, color: C.textLight, marginTop: 2, textAlign: "center" }}>{sub}</span>
        </button>
    );
}

/* ─── Dashboard page ─────────────────────────────────────────────────────── */
export default function Dashboard() {
    const navigate = useNavigate();

    /* ---------- State ---------- */
    const [user, setUser] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pregInfo, setPregInfo] = useState({ week: "—", trimester: "—", dueDate: "—" });

    /* ---------- Load data ---------- */
    useEffect(() => {
        async function load() {
            setLoading(true);
            // 1️⃣ User profile
            const { data: { user: u } = {} } = await supabase.auth.getUser();
            setUser(u);

            // 2️⃣ Pregnancy info (expected_due_date stored in user_metadata)
            if (u?.user_metadata?.expected_due_date) {
                setPregInfo(getPregnancyInfo(u.user_metadata.expected_due_date));
            }

            // 3️⃣ Latest prediction
            if (u?.id) {
                const { data, error } = await supabase
                    .from("predictions")
                    .select("*")
                    .eq("user_id", u.id)
                    .order("created_at", { ascending: false })
                    .limit(1);
                if (!error && data?.length) setPrediction(data[0]);
            }

            setLoading(false);
        }
        load();
    }, []);

    /* ---------- Derived values ---------- */
    const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User";
    const greeting = getGreeting();

    const riskLevel = prediction?.risk_level || "Low Risk";
    const riskConf = getRiskConfig(riskLevel);
    const healthTip = getHealthTip(riskLevel);
    const score = prediction?.probability_score ?? prediction?.prediction_score ?? "—";
    const lastChecked = prediction?.created_at ? new Date(prediction.created_at).toLocaleDateString() : null;

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-[#fafafa] to-[#f0e8e8]">
            <div className="w-full bg-white shadow-sm rounded-xl overflow-hidden flex flex-col" style={{ background: C.bg }}>
                {/* ---- Scrollable content ---- */}
                <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
                    {/* ── HEADER ─────────────────────────────────────────── */}
                    <div style={{ background: C.white, padding: "16px 20px 20px", marginBottom: 12, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                {/* Avatar */}
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background: C.coralLight,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: 16,
                                        color: C.coral,
                                        flexShrink: 0,
                                    }}
                                >
                                    {firstName[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p style={{ fontSize: 13, color: C.textMid, margin: 0, fontWeight: 400 }}>{greeting}</p>
                                    {loading ? (
                                        <Skeleton w={100} h={18} r={6} />
                                    ) : (
                                        <p style={{ fontSize: 19, fontWeight: 800, color: C.textDark, margin: 0, lineHeight: 1.2 }}>{firstName}</p>
                                    )}
                                </div>
                            </div>
                            {/* Notification bell */}
                            <div
                                onClick={() => navigate("/notifications")}
                                style={{ position: "relative", cursor: "pointer" }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.textDark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                <span
                                    style={{
                                        position: "absolute",
                                        top: -2,
                                        right: -2,
                                        width: 8,
                                        height: 8,
                                        background: C.coral,
                                        borderRadius: "50%",
                                        border: "1.5px solid white",
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── PREGNANCY JOURNEY CARD ───────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        onClick={() => !pregInfo && navigate("/profile")}
                        style={{
                            background: `linear-gradient(135deg, #4E7D68 0%, #6A9E87 100%)`,
                            borderRadius: 24,
                            padding: "20px 22px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                            boxShadow: "0 8px 24px rgba(78,125,104,0.30)",
                            position: "relative",
                            overflow: "hidden",
                            cursor: pregInfo ? "default" : "pointer"
                        }}
                    >
                        <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, marginBottom: 4, margin: 0 }}>
                                Pregnancy Journey
                            </p>
                            {pregInfo ? (
                                <>
                                    <h2 style={{ color: "#FFFFFF", fontSize: 32, fontWeight: 800, margin: "4px 0 6px", lineHeight: 1.1 }}>
                                        Week {pregInfo.week}
                                    </h2>
                                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>
                                        {pregInfo.trimester} Trimester • Due {pregInfo.dueDate}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 800, margin: "12px 0 6px", lineHeight: 1.1 }}>
                                        Complete profile
                                    </h2>
                                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>
                                        Set your due date to track progress
                                    </p>
                                </>
                            )}
                        </div>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                            </svg>
                        </div>
                    </motion.div>

                    {/* ── CURRENT RISK STATUS ──────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ background: C.white, borderRadius: 24, padding: "18px 20px", marginBottom: 20, boxShadow: C.shadow, border: `1px solid ${C.border}` }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textDark, margin: 0 }}>Current Risk Status</h3>
                            <button
                                onClick={() => navigate("/history")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: C.coral,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                History <span style={{ fontSize: 15 }}>›</span>
                            </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <div>
                                {loading ? (
                                    <Skeleton w={60} h={22} r={20} mb={6} />
                                ) : (
                                    <span
                                        style={{
                                            background: riskConf.bg,
                                            color: riskConf.text,
                                            fontSize: 12,
                                            fontWeight: 700,
                                            padding: "4px 12px",
                                            borderRadius: 30,
                                            display: "inline-block",
                                            marginBottom: 6,
                                        }}
                                    >
                                        {riskConf.label}
                                    </span>
                                )}
                                <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>
                                    {lastChecked ? `Last checked: ${lastChecked}` : "No checks yet"}
                                </p>
                            </div>

                            {/* Score circle */}
                            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.border}` }}>
                                {loading ? <Skeleton w={24} h={16} r={4} /> : <span style={{ fontSize: 20, fontWeight: 800, color: C.textDark }}>{score}</span>}
                            </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: C.amber, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                <span>✦</span> AI Insights available
                            </span>
                            <button onClick={() => navigate("/risk-details")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.textDark }}>
                                View Details
                            </button>
                        </div>
                    </motion.div>

                    {/* ── QUICK ACTIONS ────────────────────────────── */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textDark, marginBottom: 12 }}>Quick Actions</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <QuickCard
                                onClick={() => navigate("/prediction")}
                                iconBg="#E8EFFE"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B7FD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>}
                                label="Scan Report"
                                sub="Auto-extract data"
                            />
                            <QuickCard
                                onClick={() => navigate("/doctor")}
                                iconBg="#EFE8FE"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B60D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></svg>}
                                label="Talk to Doctor"
                                sub="Chat or book"
                            />
                            <QuickCard
                                onClick={() => navigate("/track")}
                                iconBg="#E8F4FE"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A9FD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg>}
                                label="Glucose"
                                sub="Log reading"
                            />
                            <QuickCard
                                onClick={() => navigate("/track")}
                                iconBg="#FEE8EE"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E86090" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
                                label="Blood Pressure"
                                sub="Log reading"
                            />
                        </div>
                    </motion.div>

                    {/* ── WEEKLY SUMMARY ───────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => navigate("/history")}
                        style={{
                            background: C.white,
                            borderRadius: 24,
                            padding: "18px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginBottom: 16,
                            cursor: "pointer",
                            boxShadow: C.shadow,
                            border: `1px solid ${C.border}`,
                            transition: "all 0.2s ease",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = C.shadow}
                    >
                        <div style={{
                            width: 52,
                            height: 52,
                            borderRadius: 18,
                            background: "#FDECEC",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E97A8D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>

                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 16, fontWeight: 800, color: C.textDark, margin: 0, lineHeight: 1.2 }}>Weekly Summary</p>
                            <p style={{ fontSize: 12, color: C.textMid, margin: "4px 0 0", fontWeight: 500 }}>View your health trends</p>
                        </div>

                        <span style={{ fontSize: 24, color: C.textLight, fontWeight: 300 }}>›</span>
                    </motion.div>

                    {/* ── DAILY HEALTH TIP ───────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        style={{
                            background: C.white,
                            borderRadius: 20,
                            padding: "18px 20px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 14,
                            marginBottom: 8,
                            boxShadow: C.shadow,
                            border: `1px solid ${C.border}`,
                        }}
                    >
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.coralLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill={C.coral}>
                                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 800, color: C.textDark, margin: "0 0 6px" }}>Daily Health Tip</p>
                            <p style={{ fontSize: 13, color: C.textMid, lineHeight: 1.55, margin: 0 }}>{loading ? "Loading your personalized tip..." : healthTip}</p>
                        </div>
                    </motion.div>
                </div>
            </div >
        </div >
    );
}

/* ─── Skeleton component (used while loading) ───────────────────────────── */
function Skeleton({ w = "100%", h = 20, r = 10, mb = 0 }) {
    return (
        <div
            style={{
                width: w,
                height: h,
                borderRadius: r,
                background: "linear-gradient(90deg, #F0E8E8 25%, #FCF5F5 50%, #F0E8E8 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                marginBottom: mb,
            }}
        />
    );
}

/* ─── Global CSS for shimmer animation (inject via style tag) ─────────────── */
{/* This block is already present in the original file; kept unchanged */ }
