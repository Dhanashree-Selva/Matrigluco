import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Bell,
    AlertCircle,
    Calendar,
    ShieldCheck,
    Heart,
    ChevronRight,
    MessageCircle,
    Info
} from 'lucide-react';
import { motion } from 'framer-motion';

const NOTIFICATIONS_DATA = [
    {
        id: 1,
        title: "High Glucose Alert",
        desc: "Your last glucose reading was higher than usual (142 mg/dL). Please consult your doctor.",
        time: "10 mins ago",
        type: "alert",
        icon: AlertCircle,
        bg: "bg-[#FDE8EC]",
        iconColor: "text-[#E25B76]",
        borderColor: "border-[#FDE8EC]",
        unread: true
    },
    {
        id: 2,
        title: "Prenatal Vitamin Reminder",
        desc: "Time to take your folic acid and iron supplements to support your baby's growth.",
        time: "2 hours ago",
        type: "reminder",
        icon: ShieldCheck,
        bg: "bg-[#EAF6EE]",
        iconColor: "text-[#5C9B73]",
        borderColor: "border-[#EAF6EE]",
        unread: true
    },
    {
        id: 3,
        title: "New Health Tip",
        desc: "A 10-minute walk after meals can help keep your blood sugar levels stable.",
        time: "5 hours ago",
        type: "tip",
        icon: Info,
        bg: "bg-[#FEE7EC]",
        iconColor: "text-[#F05578]",
        borderColor: "border-[#FEE7EC]",
        unread: false
    },
    {
        id: 4,
        title: "Upcoming Consultation",
        desc: "Your video checkup with Dr. Emily Chen starts in 30 minutes. Be ready!",
        time: "30 mins ago",
        type: "event",
        icon: Calendar,
        bg: "bg-[#8AB6FF]/10",
        iconColor: "text-[#8AB6FF]",
        borderColor: "border-[#8AB6FF]/20",
        unread: true
    }
];

export default function Notifications() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F8] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-white border-b border-[#F2E9E9] flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2.5 bg-[#FDF8F8] rounded-full border border-[#F2E9E9] text-[#2A2340] hover:bg-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-extrabold text-[#2A2340] tracking-tight">Notifications</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-24">
                {NOTIFICATIONS_DATA.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[32px] p-5 border border-[#F2E9E9] shadow-sm relative group active:scale-[0.98] transition-all"
                    >
                        {notif.unread && (
                            <div className="absolute top-5 right-5 w-2 h-2 bg-[#F05578] rounded-full shadow-[0_0_8px_#F05578]" />
                        )}

                        <div className="flex gap-4">
                            <div className={`w-14 h-14 ${notif.bg} rounded-[20px] flex items-center justify-center flex-shrink-0`}>
                                <notif.icon size={26} className={notif.iconColor} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-extrabold text-[#2A2340] text-sm leading-snug truncate pr-4">
                                        {notif.title}
                                    </h3>
                                </div>
                                <p className="text-xs font-bold text-[#9E8A8C] leading-relaxed mb-2 line-clamp-2">
                                    {notif.desc}
                                </p>
                                <span className="text-[10px] font-black text-[#F05578]/50 uppercase tracking-widest">
                                    {notif.time}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <div className="pt-6 text-center">
                    <button className="text-[10px] font-black text-[#9E8A8C] uppercase tracking-[0.2em] hover:text-[#F05578] transition-colors">
                        Mark all as read
                    </button>
                </div>
            </div>
        </div>
    );
}
