import { useNavigate } from 'react-router-dom';
import { Video, MessageSquare, X, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoCall() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F8] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#FEE7EC] rounded-full blur-[100px] opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#F0F4FF] rounded-full blur-[100px] opacity-50" />

            <div className="max-w-md w-full relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute -top-16 left-0 p-3 bg-white rounded-2xl border border-[#F2E9E9] text-[#2A2340] shadow-sm hover:shadow-md transition-all"
                >
                    <ArrowLeft size={20} />
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[48px] p-10 border border-[#F2E9E9] shadow-2xl text-center"
                >
                    <div className="w-24 h-24 bg-[#FEE7EC] rounded-[32px] flex items-center justify-center text-[#F05578] mx-auto mb-8 shadow-inner">
                        <Video size={40} />
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#2A2340] leading-tight mb-4 tracking-tight">
                        Video consultation will be available soon
                    </h2>

                    <p className="text-sm font-bold text-[#9E8A8C] leading-relaxed mb-10 px-4">
                        We're putting the finishing touches on our secure telehealth platform. For urgent consultation, please use our WhatsApp support.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => window.open(`https://wa.me/919000000000`, "_blank")}
                            className="w-full py-4.5 bg-[#F05578] text-white text-xs font-extrabold rounded-[24px] shadow-xl shadow-pink-100 hover:bg-[#E94D71] transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            <MessageSquare size={18} />
                            CHAT ON WHATSAPP
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-4.5 bg-white border border-[#F2E9E9] text-[#2A2340] text-xs font-extrabold rounded-[24px] hover:bg-[#FAFAFA] transition-all"
                        >
                            CLOSE
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#FDF8F8] flex items-center justify-center gap-3 grayscale opacity-50">
                        <Shield size={14} className="text-[#9E8A8C]" />
                        <span className="text-[10px] font-extrabold tracking-widest text-[#9E8A8C] uppercase">Secure Encrypted System</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
