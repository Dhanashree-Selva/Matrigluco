import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, ArrowRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Confirmation() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F8] flex flex-col items-center justify-center p-8">
            <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-sm bg-white rounded-[48px] p-12 border border-[#F2E9E9] shadow-2xl text-center relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAF6EE] opacity-20 rounded-full -mr-16 -mt-16" />

                    <div className="w-24 h-24 bg-[#EAF6EE] rounded-[36px] flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10">
                        <CheckCircle2 className="w-12 h-12 text-[#5C9B73]" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-[#2A2340] mb-4 tracking-tight leading-tight">
                        Appointment booked successfully
                    </h1>
                    <p className="text-sm font-bold text-[#9E8A8C] mb-10 leading-relaxed px-2">
                        Our healthcare team will contact you shortly to confirm your consultation details.
                    </p>

                    <div className="bg-[#FDF8F8] rounded-[32px] p-8 border border-[#F2E9E9] space-y-6 mb-10 text-left">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#F05578] shadow-sm border border-[#F2E9E9]">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-[#9E8A8C] uppercase tracking-[0.2em] mb-1">Status</p>
                                <p className="text-sm font-extrabold text-[#2A2340]">Appointment Booked</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5C89FF] shadow-sm border border-[#F2E9E9]">
                                <Phone size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-[#9E8A8C] uppercase tracking-[0.2em] mb-1">Next Step</p>
                                <p className="text-sm font-extrabold text-[#2A2340]">Wait for Call</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/doctor')}
                        className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[28px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 hover:bg-[#E94D71] transform hover:-translate-y-1 transition-all tracking-widest text-[10px]"
                    >
                        BACK TO CONSULTATION
                        <ArrowRight size={18} />
                    </button>
                </motion.div>

                <button
                    onClick={() => navigate('/history')}
                    className="mt-12 text-[10px] font-bold text-[#9E8A8C] uppercase tracking-[0.3em] hover:text-[#F05578] transition-all border-b border-transparent hover:border-[#F05578] pb-1"
                >
                    View Appointment Details
                </button>
            </div>
        </div>
    );
}
