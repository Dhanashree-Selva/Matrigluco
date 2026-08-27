import { useNavigate } from 'react-router-dom';
import { Calendar, Video, MessageCircle, ChevronRight, Clock, Star, Users, ArrowLeft, Search, Pill, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { DOCTORS, APPOINTMENTS } from '../../data/medicalData';

export default function ConsultationsHome() {
    const navigate = useNavigate();

    const getStatusStyles = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-[#EAF6EE] text-[#5C9B73]';
            case 'completed': return 'bg-gray-100 text-gray-500';
            case 'reschedule': return 'bg-[#FFF4DD] text-[#D79B2E]';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F8] pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Elegant Header */}
                <div className="p-8 bg-white border-b border-[#F2E9E9] shadow-sm rounded-b-[40px]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2.5 bg-[#FDF8F8] rounded-md border border-[#F2E9E9] text-[#2A2340]">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-extrabold text-[#2A2340] tracking-tight">Consultations</h1>
                        </div>
                        <button
                            onClick={() => navigate('/doctor/list')}
                            className="w-12 h-12 bg-[#FEE7EC] rounded-md flex items-center justify-center text-[#F05578] shadow-sm"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#FDF8F8] p-4 rounded-md border border-[#F2E9E9]">
                            <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-[0.15em] mb-1">Upcoming</p>
                            <h4 className="text-xl font-extrabold text-[#2A2340]">2 Sessions</h4>
                        </div>
                        <div className="bg-[#FDF8F8] p-4 rounded-md border border-[#F2E9E9]">
                            <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-[0.15em] mb-1">Prescriptions</p>
                            <h4 className="text-xl font-extrabold text-[#2A2340]">4 Active</h4>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-10">
                    {/* 1. Upcoming Appointments */}
                    <section>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="text-lg font-extrabold text-[#2A2340] tracking-tight">Your Schedule</h3>
                            <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#F05578] uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {APPOINTMENTS.map((apt, i) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-[32px] p-2 pr-4 border border-[#F2E9E9] shadow-sm flex items-center gap-4 hover:shadow-md transition-all group"
                                >
                                    <div className="w-20 h-24 bg-[#FAFAFA] rounded-[28px] overflow-hidden">
                                        <img src={apt.doctorImage} alt="Doc" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-grow py-2">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${getStatusStyles(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                            <div className="flex items-center gap-1 text-[#9E8A8C]">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-bold">{apt.time}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-extrabold text-[#2A2340] mb-0.5">{apt.doctor}</h4>
                                        <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-wider">{apt.specialty}</p>

                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[#2A2340]">
                                                <Calendar size={12} className="text-[#F05578]" />
                                                <span className="text-[10px] font-extrabold">{apt.date}</span>
                                            </div>
                                            {apt.status === 'upcoming' && (
                                                <button
                                                    onClick={() => navigate('/doctor/call')}
                                                    className="px-4 py-1.5 bg-[#F05578] text-white text-[9px] font-extrabold rounded-md shadow-lg shadow-pink-100 hover:bg-[#E94D71] transition-colors"
                                                >
                                                    JOIN
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Medical Care Team */}
                    <section>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="text-lg font-extrabold text-[#2A2340] tracking-tight">Care Team</h3>
                            <button onClick={() => navigate('/doctor/list')} className="w-8 h-8 bg-white border border-[#F2E9E9] rounded-md flex items-center justify-center text-[#2A2340]">
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                            {DOCTORS.slice(0, 4).map((doc, i) => (
                                <motion.div
                                    key={doc.id}
                                    whileTap={{ scale: 0.95 }}
                                    className="min-w-[140px] bg-white rounded-[32px] p-4 border border-[#F2E9E9] shadow-sm text-center relative overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/doctor/book/${doc.id}`)}
                                >
                                    <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-md border-2 border-white" />
                                    <img src={doc.image} alt={doc.name} className="w-16 h-16 rounded-[24px] object-cover mx-auto mb-3 shadow-md" />
                                    <h4 className="text-xs font-extrabold text-[#2A2340] mb-1 truncate">{doc.name}</h4>
                                    <p className="text-[9px] font-bold text-[#F05578] uppercase tracking-wider mb-3 leading-tight">{doc.specialization}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/doctor/book/${doc.id}`);
                                        }}
                                        className="w-full py-2.5 bg-[#FDF8F8] border border-[#F2E9E9] rounded-md text-[9px] font-extrabold text-[#2A2340] hover:bg-[#FEE7EC] hover:text-[#F05578] transition-all"
                                    >
                                        BOOK
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* 3. Medical Documents Grid */}
                    <section className="grid grid-cols-2 gap-4">
                        <DocCard
                            icon={Pill}
                            title="E-Prescriptions"
                            count="4 New"
                            color="bg-[#C89BFF]"
                            onClick={() => navigate('/doctor/prescriptions')}
                        />
                        <DocCard
                            icon={FileText}
                            title="Lab Reports"
                            count="12 Total"
                            color="bg-[#8AB6FF]"
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}

function DocCard({ icon: Icon, title, count, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-start p-5 bg-white rounded-[36px] border border-[#F2E9E9] shadow-sm hover:shadow-md transition-all text-left"
        >
            <div className={`w-12 h-12 ${color} rounded-md flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-100`}>
                <Icon size={24} />
            </div>
            <h4 className="text-sm font-extrabold text-[#2A2340] mb-1">{title}</h4>
            <span className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">{count}</span>
        </button>
    );
}

