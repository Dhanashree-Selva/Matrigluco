import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MessageSquare, Calendar, ArrowLeft, Filter, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { DOCTORS } from '../../data/medicalData';

const CATEGORIES = ["All", "Endocrinology", "Gynecology", "Nutrition", "Mental Health"];

export default function DoctorList() {
    const navigate = useNavigate();
    const [selectedCat, setSelectedCat] = useState("All");

    const filteredDoctors = selectedCat === "All"
        ? DOCTORS
        : DOCTORS.filter(d => d.specialization.includes(selectedCat));

    return (
        <div className="min-h-screen bg-[#FDF8F8] pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Header Area */}
                <div className="p-8 bg-white border-b border-[#F2E9E9] rounded-b-[40px] shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="p-2.5 bg-[#FDF8F8] rounded-full border border-[#F2E9E9] text-[#2A2340]">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-extrabold text-[#2A2340] tracking-tight">Our Specialists</h1>
                    </div>

                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9E8A8C]" />
                        <input
                            type="text"
                            placeholder="Search doctor or specialty..."
                            className="w-full bg-[#FDF8F8] rounded-2xl py-4 pl-12 pr-4 outline-none border border-[#F2E9E9] font-medium text-[#2A2340] focus:ring-4 focus:ring-[#FEE7EC] transition-all"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCat(cat)}
                                className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest whitespace-nowrap transition-all
                                    ${selectedCat === cat ? 'bg-[#F05578] text-white shadow-lg shadow-pink-100' : 'bg-[#FAFAFA] text-[#9E8A8C] border border-[#F2E9E9]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredDoctors.map((doc, i) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-[40px] p-6 border border-[#F2E9E9] shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500"
                            >
                                <div className="flex gap-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-24 h-28 rounded-[32px] overflow-hidden border-2 border-[#FEE7EC] shadow-inner">
                                            <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm ${doc.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-lg font-extrabold text-[#2A2340] leading-tight group-hover:text-[#F05578] transition-colors">{doc.name}</h4>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF9ED] rounded-full border border-[#FFF0D1]">
                                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                                <span className="text-[10px] font-extrabold text-[#D79B2E]">{doc.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-[#F05578] uppercase tracking-[0.2em] mb-4">{doc.specialization}</p>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2.5 text-[#9E8A8C]">
                                                <div className="w-6 h-6 rounded-lg bg-[#EAF6EE] flex items-center justify-center">
                                                    <MapPin size={12} className="text-[#5C9B73]" />
                                                </div>
                                                <span className="text-[10px] font-bold">St. Mary's Women's Center</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-[#9E8A8C]">
                                                <div className="w-6 h-6 rounded-lg bg-[#FEE7EC] flex items-center justify-center">
                                                    <Calendar size={12} className="text-[#F05578]" />
                                                </div>
                                                <span className="text-[10px] font-bold">{doc.availableSlot}</span>
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-[9px] font-bold text-[#9E8A8C] uppercase tracking-widest italic">* For urgent consultation</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => navigate(`/doctor/book/${doc.id}`)}
                                                className="flex-[2] py-3.5 bg-[#F05578] text-white text-[10px] font-extrabold rounded-2xl shadow-lg shadow-pink-100 hover:bg-[#E94D71] transform hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                            >
                                                BOOK APPOINTMENT
                                            </button>
                                            <button
                                                onClick={() => window.open(`https://wa.me/${doc.whatsappNumber}`, "_blank")}
                                                className="flex-1 py-3.5 bg-white border border-[#F2E9E9] rounded-2xl flex items-center justify-center text-[#2A2340] hover:bg-[#FDF8F8] hover:border-[#F05578] hover:text-[#F05578] transition-all group/wa"
                                                title="Chat on WhatsApp"
                                            >
                                                <MessageSquare size={18} className="group-hover/wa:scale-110 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Tag({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${active ? 'bg-pink-500 text-white shadow-lg shadow-pink-100' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'}`}
        >
            {label}
        </button>
    );
}
