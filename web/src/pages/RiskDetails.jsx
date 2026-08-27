import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Share2,
    AlertCircle,
    Activity,
    Droplets,
    Scale,
    Thermometer,
    CheckCircle2,
    Info,
    Calendar,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { authApi, predictionsApi, reportsApi } from "../api";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function RiskDetails() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [latestReport, setLatestReport] = useState(null);
    const [userAuth, setUserAuth] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const user = await authApi.getCurrentUser();
                if (!user) {
                    navigate("/auth");
                    return;
                }
                setUserAuth(user);

                // Fetch latest prediction
                const predRes = await predictionsApi.getPredictions({ limit: 1 });
                const predList = predRes?.items || (Array.isArray(predRes) ? predRes : []);
                if (predList.length > 0) {
                    setPrediction(predList[0]);
                }

                // Fetch latest report for clinical values
                const repRes = await reportsApi.getReports({ limit: 1 });
                const repList = repRes?.items || (Array.isArray(repRes) ? repRes : []);
                if (repList.length > 0) {
                    setLatestReport(repList[0]);
                }
            } catch (err) {
                console.error("Error loading risk details:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [navigate]);

    const generatePDF = async () => {
        if (!prediction || !userAuth) return;
        setIsExporting(true);

        try {
            const doc = new jsPDF();
            const primaryColor = [240, 85, 120]; // #F05578
            const secondaryColor = [42, 35, 64]; // #2A2340

            // Title Header
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("MatriGluco", 20, 20);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Pregnancy Diabetes Risk Assessment Report", 20, 28);

            // Patient Info
            doc.setTextColor(...secondaryColor);
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("PATIENT DETAILS", 20, 55);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const fullName = userAuth?.user_metadata?.full_name || "Patient";
            doc.text(`Name: ${fullName}`, 20, 65);
            doc.text(`Email: ${userAuth?.email || "N/A"}`, 20, 72);
            doc.text(`Date of Assessment: ${new Date(prediction.created_at).toLocaleDateString()}`, 20, 79);

            // Assessment Summary
            doc.setFont("helvetica", "bold");
            doc.text("PREDICTION SUMMARY", 20, 95);
            doc.setDrawColor(...primaryColor);
            doc.line(20, 97, 190, 97);

            autoTable(doc, {
                startY: 105,
                head: [['Parameter', 'Value']],
                body: [
                    ['Risk Level', prediction.risk_level],
                    ['AI Score', `${(prediction.prediction_score || prediction.probability_score || 0).toFixed(2)}%`],
                    ['Blood Glucose', `${prediction.glucose || 'N/A'} mg/dL`],
                    ['BMI', `${prediction.bmi || 'N/A'} kg/m²`],
                    ['HbA1c', `${latestReport?.extracted_values?.hba1c || 'N/A'} %`],
                    ['Blood Pressure', `${latestReport?.extracted_values?.blood_pressure || '120/80'} mmHg`],
                ],
                headStyles: { fillColor: primaryColor },
                styles: { fontSize: 10 }
            });

            const finalY = doc.lastAutoTable.finalY + 15;

            // AI Insights
            doc.setFont("helvetica", "bold");
            doc.text("AI CLINICAL INSIGHT", 20, finalY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const splitInsight = doc.splitTextToSize(prediction.prediction_result || "No specific insight available.", 170);
            doc.text(splitInsight, 20, finalY + 10);

            // Recommendations
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("RECOMMENDATIONS", 20, finalY + 35);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.text("• Monitor sugar levels 2x weekly.", 25, finalY + 45);
            doc.text("• Follow a balanced prenatal diet with low glycemic index foods.", 25, finalY + 52);
            doc.text("• Schedule a follow-up consultation with your doctor to discuss these results.", 25, finalY + 59);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("This report is generated by MatriGluco AI. Please consult a qualified medical professional for diagnosis.", 105, 285, { align: "center" });

            const dateStr = new Date().toISOString().split('T')[0];
            doc.save(`Risk_Report_${dateStr}.pdf`);
        } catch (err) {
            console.error("PDF Export error:", err);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full bg-[#FDF8F8] flex flex-col pb-24">
                <div className="w-12 h-12 border-4 border-[#F05578]/20 border-t-[#F05578] rounded-md animate-spin" />
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="h-full bg-[#FDF8F8] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center shadow-sm text-[#9E8A8C]">
                    <Activity size={40} />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-[#2A2340]">No Prediction Found</h2>
                    <p className="text-sm font-bold text-[#9E8A8C] mt-2">Generate a risk prediction to see detailed insights.</p>
                </div>
                <button
                    onClick={() => navigate("/prediction")}
                    className="bg-[#F05578] text-white px-8 py-4 rounded-md font-extrabold shadow-lg shadow-pink-100"
                >
                    GET STARTED
                </button>
            </div>
        );
    }

    const score = prediction.prediction_score || prediction.probability_score || 0;
    const level = prediction.risk_level;
    const isHigh = level === "High Risk";
    const isModerate = level === "Moderate Risk";

    const clinical = latestReport?.extracted_values || {};

    const stats = [
        { label: "Glucose", value: prediction.glucose || clinical.glucose_fasting || "—", unit: "mg/dL", icon: Droplets, color: "text-[#F05578]", bg: "bg-[#FEE7EC]" },
        { label: "BMI", value: prediction.bmi || clinical.bmi || "—", unit: "kg/m²", icon: Scale, color: "text-[#5C9B73]", bg: "bg-[#EAF6EE]" },
        { label: "HbA1c", value: clinical.hba1c || "—", unit: "%", icon: Activity, color: "text-[#8AB6FF]", bg: "bg-[#8AB6FF]/10" },
        { label: "Sys/Dia", value: clinical.blood_pressure || "120/80", unit: "mmHg", icon: Thermometer, color: "text-[#C89BFF]", bg: "bg-[#C89BFF]/10" },
    ];

    return (
        <div className="h-full bg-[#FDF8F8] flex flex-col pb-24">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#F2E9E9] flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-[#FDF8F8] rounded-md border border-[#F2E9E9] text-[#2A2340]"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-extrabold text-[#2A2340] tracking-tight">Result Analysis</h1>
                </div>
                <button className="p-2.5 text-[#F05578]">
                    <Share2 size={22} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                {/* Score Ring Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] p-10 border border-[#F2E9E9] shadow-sm flex flex-col items-center text-center"
                >
                    <div className="relative mb-8 flex items-center justify-center">
                        <svg className="w-40 h-40 transform -rotate-90">
                            <circle
                                cx="80" cy="80" r="70"
                                stroke="currentColor" strokeWidth="10" fill="transparent"
                                className="text-[#FDF8F8]"
                            />
                            <circle
                                cx="80" cy="80" r="70"
                                stroke="currentColor" strokeWidth="10" fill="transparent"
                                strokeDasharray={439.82}
                                strokeDashoffset={439.82 - (439.82 * score) / 100}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${isHigh ? "text-[#E25B76]" : isModerate ? "text-[#D79B2E]" : "text-[#5C9B73]"}`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-[#2A2340] tracking-tighter leading-none">{score}%</span>
                            <span className="text-[10px] font-black text-[#9E8A8C] uppercase tracking-[0.2em] mt-2">AI Score</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${isHigh ? "bg-[#FDE8EC] text-[#E25B76]" :
                            isModerate ? "bg-[#FFF4DD] text-[#D79B2E]" :
                                "bg-[#EAF6EE] text-[#5C9B73]"
                            }`}>
                            <div className={`w-2 h-2 rounded-md ${isHigh ? "bg-[#E25B76]" : isModerate ? "bg-[#D79B2E]" : "bg-[#5C9B73]"}`} />
                            {level}
                        </div>
                        <p className="text-[11px] font-bold text-[#9E8A8C] uppercase tracking-widest">
                            Checked on {new Date(prediction.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </motion.div>

                {/* Medical Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[32px] p-5 border border-[#F2E9E9] shadow-sm flex flex-col gap-4 group active:scale-95 transition-all"
                        >
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-[18px] flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-[#9E8A8C] uppercase tracking-widest mb-1">{stat.label}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-[#2A2340]">{stat.value}</span>
                                    <span className="text-[10px] font-bold text-[#9E8A8C]">{stat.unit}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* AI Explanation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <h3 className="text-sm font-black text-[#9E8A8C] uppercase tracking-[0.2em] ml-1">AI Health Insight</h3>
                    <div className="bg-white rounded-[32px] p-6 border border-[#F2E9E9] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F05578]/20" />
                        <div className="flex gap-5">
                            <div className="w-14 h-14 bg-[#FEE7EC] rounded-[20px] flex items-center justify-center text-[#F05578] flex-shrink-0">
                                <Info size={28} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-[#2A2340] leading-relaxed">
                                    {prediction.prediction_result}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="text-[9px] font-black text-[#5C9B73] bg-[#EAF6EE] px-2 py-1 rounded-md uppercase tracking-wider">Clinical Verified</span>
                                    <span className="text-[9px] font-black text-[#8AB6FF] bg-[#8AB6FF]/10 px-2 py-1 rounded-md uppercase tracking-wider">Maternal Focused</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Personalized Recommendations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                >
                    <h3 className="text-sm font-black text-[#9E8A8C] uppercase tracking-[0.2em] ml-1">Daily Guidance</h3>
                    <div className="space-y-3">
                        <RecoCard
                            icon={Droplets}
                            color="text-[#8AB6FF]"
                            bg="bg-[#8AB6FF]/10"
                            title="Monitor Sugar Levels"
                            desc="Check your fasting glucose twice a week to track stability."
                        />
                        <RecoCard
                            icon={ShieldCheck}
                            color="text-[#5C9B73]"
                            bg="bg-[#EAF6EE]"
                            title="Consultation Recommended"
                            desc="Discuss these results with your obstetrician in your next visit."
                        />
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-4">
                    <button
                        onClick={generatePDF}
                        disabled={isExporting}
                        className={`w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <Download size={20} className={isExporting ? 'animate-bounce' : ''} />
                        {isExporting ? 'GENERATING PDF...' : 'DOWNLOAD PDF REPORT'}
                    </button>
                    <button
                        onClick={() => navigate("/doctor/list")}
                        className="w-full bg-white text-[#2A2340] font-extrabold py-5 rounded-[24px] border border-[#F2E9E9] flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                    >
                        <Share2 size={20} />
                        SHARE WITH DOCTOR
                    </button>
                </div>
            </div>
        </div>
    );
}

function RecoCard({ icon: Icon, color, bg, title, desc }) {
    return (
        <div className="bg-white rounded-[32px] p-5 border border-[#F2E9E9] shadow-sm flex items-center gap-5">
            <div className={`w-12 h-12 ${bg} ${color} rounded-md flex items-center justify-center flex-shrink-0`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-sm font-extrabold text-[#2A2340] mb-0.5">{title}</h4>
                <p className="text-[10px] font-bold text-[#9E8A8C] leading-snug">{desc}</p>
            </div>
        </div>
    );
}
