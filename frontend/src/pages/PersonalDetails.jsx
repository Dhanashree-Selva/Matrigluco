import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Mail, Heart, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function PersonalDetails() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Form states
    const [fullName, setFullName] = useState("");
    const [dueDate, setDueDate] = useState("");

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser(user);
            setFullName(user.user_metadata?.full_name || "");
            setDueDate(user.user_metadata?.expected_due_date || "");
        } else {
            navigate('/auth');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ text: "", type: "" });

        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: fullName,
                expected_due_date: dueDate
            }
        });

        if (error) {
            setMessage({ text: "Error: " + error.message, type: "error" });
        } else {
            setMessage({ text: "Changes saved successfully!", type: "success" });
            setUser(data.user);
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
        setSaving(false);
    };

    const getWeek = (dueDateStr) => {
        if (!dueDateStr) return "—";
        const due = new Date(dueDateStr);
        const today = new Date();
        const diffDays = Math.max(0, Math.round((due - today) / (1000 * 60 * 60 * 24)));
        let week = 40 - Math.floor(diffDays / 7);
        return Math.max(1, Math.min(40, week));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin" />
            </div>
        );
    }

    const pregWeek = getWeek(dueDate);

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-24 max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Personal Details</h1>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : null}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 mb-8">
                <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50/50 transition-all font-medium text-gray-700"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                            />
                        </div>
                    </div>

                    {/* Email (Read Only) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email (Read-only)</label>
                        <div className="relative opacity-60">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                className="w-full border border-gray-100 bg-gray-100 rounded-2xl pl-12 pr-4 py-4 outline-none font-medium text-gray-500 cursor-not-allowed"
                                value={user?.email || ""}
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Expected Due Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Expected Due Date</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <input
                                type="date"
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50/50 transition-all font-medium text-gray-700"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Pregnancy Week (Calculated) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Current Progress</label>
                        <div className="flex items-center gap-4 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Heart className="w-6 h-6 text-pink-500" />
                            </div>
                            <div>
                                <p className="text-gray-800 font-bold text-lg">
                                    {pregWeek === "—" ? "Set due date" : `Week ${pregWeek}`}
                                </p>
                                <p className="text-pink-500 text-xs font-semibold">Pregnancy Week</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-pink-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-pink-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-pink-200"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <><Save className="w-5 h-5" /> Save Changes</>
                    )}
                </button>
            </div>
        </div>
    );
}
