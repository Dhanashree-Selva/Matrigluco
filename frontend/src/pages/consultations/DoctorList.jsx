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
                {filteredDoctors.map((doc, i) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-[32px] p-5 border border-[#F2E9E9] shadow-sm relative overflow-hidden group hover:shadow-md transition-all"
                    >
                        <div className="flex gap-5">
                            <div className="relative">
                                <img src={doc.image} alt={doc.name} className="w-20 h-24 rounded-[28px] object-cover shadow-sm group-hover:scale-105 transition-transform duration-500" />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${doc.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>

                            <div className="flex-grow">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-base font-extrabold text-[#2A2340] leading-tight">{doc.name}</h4>
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-extrabold text-[#2A2340]">{doc.rating}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-[#F05578] uppercase tracking-[0.1em] mb-2">{doc.specialization}</p>

                                <div className="flex items-center gap-3 mb-4 text-[#9E8A8C]">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={10} className="text-[#F8A7B8]" />
                                        <span className="text-[10px] font-bold">St. Mary's Clinic</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={10} className="text-[#8AB6FF]" />
                                        <span className="text-[10px] font-bold">{doc.availability}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/doctor/book/${doc.id}`)}
                                        className="flex-1 py-3 bg-[#F05578] text-white text-[10px] font-extrabold rounded-2xl shadow-lg shadow-pink-100 hover:bg-[#E94D71] transition-all"
                                    >
                                        BOOK NOW
                                    </button>
                                    <button className="p-3 bg-[#FDF8F8] border border-[#F2E9E9] rounded-2xl text-[#2A2340] hover:bg-[#FEE7EC] transition-all">
                                        <MessageSquare size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
