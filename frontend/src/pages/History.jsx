import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
    ArrowLeft,
    Clock,
    Droplet,
    Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function History() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);

            // Fetch ALL from predictions table temporarily for testing
            const { data, error } = await supabase
                .from("predictions")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setRecords(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        if (!level) return "bg-gray-100 text-gray-800 border-gray-200";
        const lower = level.toLowerCase();
        if (lower.includes("high")) return "bg-red-50 text-red-600 border-red-200";
        if (lower.includes("moderate")) return "bg-yellow-50 text-yellow-600 border-yellow-200";
        return "bg-green-50 text-green-600 border-green-200";
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Unknown Date";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen relative pb-24">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-full shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">
                    Prediction History
                </h1>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 mt-10">
                    <div className="w-12 h-12 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading history...</p>
                </div>
            ) : records.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 text-center"
                >
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex flex-col items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No prediction history yet</h3>
                    <p className="text-sm text-gray-500 max-w-lg mx-auto">
                        Take an AI risk assessment to see your history logged here. Ensure you are signed in.
                    </p>
                    <button
                        onClick={() => navigate('/prediction')}
                        className="mt-6 px-6 py-3 bg-pink-500 text-white font-semibold rounded-xl"
                    >
                        Check Risk Now
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {records.map((record, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={record.id}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800">
                                        {record.prediction_result || "Unknown"}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(record.created_at)}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 text-xs font-bold rounded-full border ${getRiskColor(record.risk_level)}`}>
                                    {record.risk_level} • {record.probability_score || record.prediction_score}%
                                </div>
                            </div>

                            <div className="flex bg-gray-50 rounded-xl p-3 gap-3 border border-gray-100">
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Droplet className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Glucose</p>
                                        <p className="font-semibold text-gray-700 text-sm">
                                            {record.glucose} <span className="text-[10px] text-gray-400 font-normal">mg/dL</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="w-px bg-gray-200"></div>

                                <div className="flex-1 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">BMI</p>
                                        <p className="font-semibold text-gray-700 text-sm">{record.bmi}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
