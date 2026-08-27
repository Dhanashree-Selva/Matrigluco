import { useState, useEffect } from 'react';
import { User, Settings, LogOut, Heart, Bell, Calendar, Shield, Activity, TrendingUp, ChevronRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi, predictionsApi } from '../api';
import { motion } from 'framer-motion';

const COLORS = {
    bg: "#FDF8F8",
    white: "#FFFFFF",
    navy: "#2A2340",
    muted: "#9E8A8C",
    coral: "#F05578",
    softCoral: "#E97A8D",
    paleCoral: "#FDECEF",
    border: "#F4EAEA",
    green: "#5C9B73",
    softGreen: "#EAF6EE",
    blue: "#8AB6FF",
    softBlue: "#8AB6FF/10",
    purple: "#C89BFF"
};

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dueDate, setDueDate] = useState("");
    const [fullName, setFullName] = useState("");
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const u = await authApi.getCurrentUser();
            if (u) {
                setUser(u);
                setFullName(u.full_name || u.user_metadata?.full_name || "");
                setDueDate(u.due_date || u.expected_due_date || u.user_metadata?.expected_due_date || "");

                const predRes = await predictionsApi.getPredictions({ limit: 1 });
                const list = predRes?.items || (Array.isArray(predRes) ? predRes : []);
                if (list.length) setPrediction(list[0]);
            } else {
                navigate('/auth');
            }
        } catch (err) {
            console.error("Profile load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await authApi.logout();
        navigate('/auth');
    };

    const getPregnancyStatus = (dueDateStr) => {
        if (!dueDateStr) return "Profile Incomplete";
        const due = new Date(dueDateStr);
        const today = new Date();
        const diffDays = Math.max(0, Math.round((due - today) / (1000 * 60 * 60 * 24)));
        const week = 40 - Math.floor(diffDays / 7);
        const cappedWeek = Math.max(1, Math.min(40, week));

        let trimester = "1st";
        if (cappedWeek >= 14 && cappedWeek <= 27) trimester = "2nd";
        else if (cappedWeek >= 28) trimester = "3rd";

        return `Week ${cappedWeek} • ${trimester} Trimester`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh] bg-[#FDF8F8]">
                <div className="w-10 h-10 border-4 border-[#F05578]/20 border-t-[#F05578] rounded-md animate-spin" />
            </div>
        );
    }

    const status = getPregnancyStatus(dueDate);
    const riskLevel = prediction?.risk_level || "No Checks";

    return (
        <div className="h-full bg-[#FDF8F8] flex flex-col pb-24">
            {/* Header */}
            <div className="p-6 flex justify-between items-center bg-white border-b border-[#F4EAEA]">
                <h1 className="text-xl font-extrabold text-[#2A2340] tracking-tight">Profile</h1>
                <button
                    onClick={() => navigate('/notifications')}
                    className="w-11 h-11 bg-[#FDF8F8] rounded-md flex items-center justify-center border border-[#F4EAEA] text-[#2A2340]"
                >
                    <Settings size={20} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                {/* Profile Brief Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] p-8 border border-[#F4EAEA] shadow-sm flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#F05578]/10" />
                    <div className="w-24 h-24 bg-[#E97A8D] rounded-[40px] mb-4 flex items-center justify-center shadow-lg shadow-pink-100 border-4 border-white">
                        <User size={42} className="text-white" />
                    </div>
                    <h2 className="text-xl font-black text-[#2A2340] mb-1">{fullName || "User Name"}</h2>
                    <p className="text-xs font-bold text-[#9E8A8C] mb-4">{user?.email}</p>

                    <div className="px-5 py-2 bg-[#FDECEF] text-[#D96B82] rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#D96B82] rounded-md animate-pulse" />
                        {status}
                    </div>
                </motion.div>

                {/* Health Overview */}
                <div className="grid grid-cols-2 gap-4">
                    <SummaryCard
                        label="LATEST RISK"
                        value={riskLevel}
                        icon={Activity}
                        bg="bg-[#EAF6EE]"
                        color="text-[#5C9B73]"
                    />
                    <SummaryCard
                        label="GLUCOSE"
                        value={prediction?.glucose ? `${prediction.glucose} mg/dL` : "—"}
                        icon={TrendingUp}
                        bg="bg-[#FEE7EC]"
                        color="text-[#F05578]"
                    />
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-[32px] border border-[#F4EAEA] shadow-sm overflow-hidden divide-y divide-[#F4EAEA]">
                    <MenuLink
                        icon={User}
                        label="Personal Details"
                        sub="Personal info & pregnancy data"
                        onClick={() => navigate('/profile/details')}
                        iconColor="text-[#8AB6FF]"
                        iconBg="bg-[#8AB6FF]/10"
                    />
                    <MenuLink
                        icon={Bell}
                        label="Notifications"
                        sub="Activity & health alerts"
                        onClick={() => navigate('/notifications')}
                        iconColor="text-[#C89BFF]"
                        iconBg="bg-[#C89BFF]/10"
                    />
                    <MenuLink
                        icon={Shield}
                        label="Account Security"
                        sub="Password & privacy control"
                        onClick={() => navigate('/profile/security')}
                        iconColor="text-[#5C9B73]"
                        iconBg="bg-[#EAF6EE]"
                    />
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 p-5 hover:bg-[#FDECEF]/30 transition-colors"
                    >
                        <div className="w-12 h-12 bg-[#FDECEF] rounded-[20px] flex items-center justify-center text-[#D96B82]">
                            <LogOut size={22} />
                        </div>
                        <div className="flex-1 text-left">
                            <h4 className="text-sm font-black text-[#2A2340]">Log Out</h4>
                            <p className="text-[10px] font-bold text-[#D96B82] uppercase tracking-widest">End Session</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ label, value, icon: Icon, bg, color }) {
    return (
        <div className="bg-white p-5 rounded-[32px] border border-[#F4EAEA] shadow-sm">
            <div className={`w-11 h-11 ${bg} ${color} rounded-md flex items-center justify-center mb-3`}>
                <Icon size={22} />
            </div>
            <p className="text-[9px] font-black text-[#9E8A8C] uppercase tracking-[0.14em] mb-1">{label}</p>
            <p className={`text-xs font-black truncate ${color}`}>{value}</p>
        </div>
    );
}

function MenuLink({ icon: Icon, label, sub, onClick, iconColor, iconBg }) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-4 p-5 hover:bg-[#FDF8F8] transition-colors group">
            <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-[20px] flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={22} />
            </div>
            <div className="flex-1 text-left">
                <h4 className="text-sm font-black text-[#2A2340] mb-0.5">{label}</h4>
                <p className="text-[10px] font-bold text-[#9E8A8C] leading-snug">{sub}</p>
            </div>
            <ChevronRight size={18} className="text-[#9E8A8C]" />
        </button>
    );
}
