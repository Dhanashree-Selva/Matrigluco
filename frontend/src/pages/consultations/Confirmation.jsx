import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Confirmation() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F8] flex flex-col items-center justify-center p-8">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-white rounded-[40px] p-10 border border-[#F2E9E9] shadow-sm text-center"
            >
                <div className="w-24 h-24 bg-[#EAF6EE] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <CheckCircle2 className="w-12 h-12 text-[#5C9B73]" />
                </div>

                <h1 className="text-2xl font-extrabold text-[#2A2340] mb-3 tracking-tight">Booking Confirmed!</h1>
                <p className="text-sm font-bold text-[#9E8A8C] mb-10 leading-relaxed px-4">
                    Your appointment with Dr. Sarah Jenkins has been successfully scheduled.
                </p>

                <div className="bg-[#FDF8F8] rounded-3xl p-6 border border-[#F2E9E9] space-y-4 mb-10">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-[#FEE7EC] rounded-2xl flex items-center justify-center text-[#F05578]">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">Date</p>
                            <p className="text-sm font-extrabold text-[#2A2340]">Monday, June 12</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-[#FEE7EC] rounded-2xl flex items-center justify-center text-[#F05578]">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">Time</p>
                            <p className="text-sm font-extrabold text-[#2A2340]">10:30 AM (GMT +5:30)</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/doctor')}
                    className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100 flex items-center justify-center gap-2 hover:bg-[#E94D71] transition-all tracking-tight"
                >
                    BACK TO HOME
                    <ArrowRight size={18} />
                </button>
            </motion.div>

            <button
                onClick={() => navigate('/history')}
                className="mt-10 text-xs font-bold text-[#9E8A8C] uppercase tracking-[0.2em] hover:text-[#F05578] transition-colors"
            >
                View Appointment Details
            </button>
        </div>
    );
}
