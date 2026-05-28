import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Target,
    AlertCircle,
    ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Track() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState("");

    // Modern medical palette (non-pink)
    const COLORS = {
        primary: "#3b82f6", // soft vivid blue
        green: "#10b981",
        yellow: "#f59e0b",
        red: "#ef4444",
        bg: "#f8fafc", // slate 50
        cardBg: "rgba(255, 255, 255, 0.8)",
    };

    useEffect(() => {
        fetchTrackingData();
    }, []);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const { data: records, error } = await supabase
                .from("predictions")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching tracking data:", error);
            } else if (records && records.length > 0) {
                const formattedData = records.map((record) => {
                    const date = new Date(record.created_at);
                    return {
                        ...record,
                        formattedDate: `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`,
                        probability: record.probability_score || record.prediction_score || 0,
                    };
                });
                setData(formattedData);
                generateInsights(formattedData);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateInsights = (records) => {
        if (records.length < 2) {
            setInsights("Consistency is key. Keep logging your health reports to unlock dynamic AI insights.");
            return;
        }

        const last = records[records.length - 1];
        const prev = records[records.length - 2];
        const riskDiff = last.probability - prev.probability;
        const glucoseDiff = last.glucose - prev.glucose;

        if (riskDiff >= 10) {
            setInsights(`Your diabetes risk increased recently. Please monitor closely and stay active.`);
        } else if (riskDiff <= -5) {
            setInsights(`Great job! Your risk score improved. Keep up the healthy lifestyle.`);
        } else if (glucoseDiff > 20) {
            setInsights(`We noticed a spike in your glucose levels compared to your last log. Make sure to stay hydrated and manage carbs.`);
        } else if (glucoseDiff < -10) {
            setInsights(`Your blood glucose is stabilizing beautifully! Stay on track.`);
        } else {
            setInsights(`Your health metrics are stable. Consistency is your best defense!`);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-50 min-h-screen p-6 pb-24">
                <div className="animate-pulse space-y-6">
                    <div className="h-40 bg-white rounded-3xl shadow-sm"></div>
                    <div className="h-64 bg-white rounded-3xl shadow-sm"></div>
                    <div className="h-64 bg-white rounded-3xl shadow-sm"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <Activity className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">No Tracking Data</h2>
                <p className="text-slate-500 mb-8 max-w-[280px]">
                    Complete a risk assessment to start tracking your health journey.
                </p>
                <button
                    onClick={() => navigate("/prediction")}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-medium shadow-md w-full"
                >
                    Start Tracking
                </button>
            </div>
        );
    }

    const latestRecord = data[data.length - 1];

    // Process distribution for Pie Chart
    const riskCounts = data.reduce((acc, curr) => {
        const lvl = (curr.risk_level || "").toLowerCase();
        if (lvl.includes("high")) acc.high++;
        else if (lvl.includes("moderate")) acc.moderate++;
        else acc.low++;
        return acc;
    }, { low: 0, moderate: 0, high: 0 });

    const pieData = [
        { name: "Low Risk", value: riskCounts.low, color: COLORS.green },
        { name: "Moderate", value: riskCounts.moderate, color: COLORS.yellow },
        { name: "High Risk", value: riskCounts.high, color: COLORS.red },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-[#f0f4f8] min-h-screen pb-24 font-sans text-slate-800 selection:bg-blue-100">
            {/* Header */}
            <div className="pt-12 pb-6 px-6 sticky top-0 bg-[#f0f4f8]/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-500">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
                </div>
            </div>

            <div className="px-6 space-y-6">
                {/* Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -mr-10 -mt-10" />

                    <p className="text-sm text-slate-500 font-medium mb-1 relative z-10">Your Health Journey</p>
                    <h2 className="text-2xl font-bold tracking-tight mb-8 relative z-10">
                        {data.length} Logs Analyzed
                    </h2>

                    <div className="flex items-end justify-between relative z-10">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Latest Assessment
                            </p>
                            <p className="font-semibold text-lg flex items-center gap-2">
                                {latestRecord.risk_level}
                                {latestRecord.risk_level?.toLowerCase().includes("low") && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold font-mono tracking-tighter text-blue-600">
                                {latestRecord.probability}<span className="text-lg text-slate-400 font-sans">%</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Risk Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                            <Target className="w-4 h-4 text-slate-700" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Diabetes Risk Trend</h3>
                    </div>

                    <div className="h-56 w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600, color: '#0f172a' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="probability"
                                    stroke={COLORS.primary}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRisk)"
                                    activeDot={{ r: 6, fill: COLORS.primary, stroke: '#fff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Glucose Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                            <Activity className="w-4 h-4 text-slate-700" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Blood Glucose Trend</h3>
                    </div>

                    <div className="h-56 w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2} />
                                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#64748b' }}
                                    domain={['dataMin - 10', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600, color: '#0f172a' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="glucose"
                                    stroke={COLORS.green}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorGlucose)"
                                    activeDot={{ r: 6, fill: COLORS.green, stroke: '#fff', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* AI Insights and Distribution row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                    >
                        <h3 className="font-semibold text-slate-800 mb-2">Risk Distribution</h3>
                        <p className="text-xs text-slate-400 mb-4">Ratio of your historical assessments</p>

                        <div className="h-40 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Dynamic Insight */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden text-white shadow-xl shadow-slate-200"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-full opacity-50 -mr-10 -mt-10" />

                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold tracking-wide">Health Insight</h3>
                        </div>

                        <p className="text-slate-300 leading-relaxed text-sm relative z-10">
                            {insights}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
