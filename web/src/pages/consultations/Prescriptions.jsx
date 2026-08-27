import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Clock, Calendar, Download, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { PRESCRIPTIONS } from '../../data/medicalData';

export default function Prescriptions() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#FDF8F8] pb-24">
            {/* Elegant Header */}
            <div className="p-8 bg-white border-b border-[#F2E9E9] rounded-b-[40px] shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-[#FDF8F8] rounded-md border border-[#F2E9E9] text-[#2A2340]">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-extrabold text-[#2A2340] tracking-tight">Prescriptions</h1>
                </div>

                <div className="bg-[#FEE7EC] p-5 rounded-md border border-[#F2E9E9] flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[#F05578] shadow-sm">
                        <Pill size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-extrabold text-[#2A2340]">Upcoming Supply</h4>
                        <p className="text-[10px] font-bold text-[#F05578] uppercase tracking-widest">Refill in 4 days</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-sm font-bold text-[#9E8A8C] uppercase tracking-widest mb-6 ml-1">Current Regimen</h3>

                <div className="space-y-6">
                    {PRESCRIPTIONS.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[32px] p-6 border border-[#F2E9E9] shadow-sm relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 bg-[#FDF8F8] border border-[#F2E9E9] rounded-[22px] flex items-center justify-center ${i % 2 === 0 ? 'text-[#C89BFF]' : 'text-[#8AB6FF]'}`}>
                                        <Pill size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-extrabold text-[#2A2340] leading-tight">{item.medicine}</h4>
                                        <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-[0.15em]">{item.dosage}</p>
                                    </div>
                                </div>
                                <button className="p-2.5 bg-[#FAFAFA] rounded-md text-[#9E8A8C] hover:text-[#F05578]">
                                    <Download size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-[#FDF8F8] rounded-md border border-[#F2E9E9]">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Clock size={12} className="text-[#F05578]" />
                                        <span className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">Time</span>
                                    </div>
                                    <p className="text-xs font-extrabold text-[#2A2340]">{item.frequency}</p>
                                </div>
                                <div className="p-4 bg-[#FDF8F8] rounded-md border border-[#F2E9E9]">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Info size={12} className="text-[#F8A7B8]" />
                                        <span className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">Duration</span>
                                    </div>
                                    <p className="text-xs font-extrabold text-[#2A2340]">30 Days</p>
                                </div>
                            </div>

                            <div className="pt-5 border-t border-[#F2E9E9] flex items-center justify-between">
                                <p className="text-[11px] font-medium text-[#9E8A8C] italic">"{item.instructions}"</p>
                                <span className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${item.status === 'Active' ? 'bg-[#EAF6EE] text-[#5C9B73]' : 'bg-gray-100 text-gray-400'}`}>
                                    {item.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
