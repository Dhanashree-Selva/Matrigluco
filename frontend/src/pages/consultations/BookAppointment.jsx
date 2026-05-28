import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DOCTORS } from '../../data/medicalData';

const SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

export default function BookAppointment() {
    const navigate = useNavigate();
    const { id } = useParams();
    const doctor = DOCTORS.find(d => d.id === parseInt(id)) || DOCTORS[1];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Days in current month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Find the first day of the month (0=Sunday, 1=Monday...)
        const firstDay = new Date(year, month, 1).getDay();

        // Adjust for Monday start (M=0, T=1... S=6)
        const offset = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];

        // Add empty cells for offset
        for (let i = 0; i < offset; i++) {
            days.push(null);
        }

        // Add actual days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    }, [currentDate]);

    const isPast = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const isSelected = (date) => {
        if (!date) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    return (
        <div className="min-h-screen bg-[#FDF8F8] relative">
            <div className="pb-[90px]">
                {/* Header */}
                <div className="flex items-center px-6 py-4 bg-[#FDF8F8]">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F2E9E9] hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#2A2340]" />
                    </button>
                    <h1 className="flex-1 text-center text-xl font-extrabold text-[#2A2340] -ml-10 tracking-tight">Book Appointment</h1>
                </div>

                <div className="p-6">
                    <h2 className="text-base font-extrabold text-[#2A2340] mb-6 tracking-tight">Select Date & Time</h2>

                    {/* Calendar Card */}
                    <div className="bg-white rounded-[32px] p-6 shadow-sm mb-10 border border-[#F2E9E9]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-extrabold text-[#2A2340] tracking-tight">{monthName} {year}</h3>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-[#FDF8F8] border border-[#F2E9E9] flex items-center justify-center text-[#9E8A8C] hover:text-[#F05578]">
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-[#FDF8F8] border border-[#F2E9E9] flex items-center justify-center text-[#9E8A8C] hover:text-[#F05578]">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Day labels */}
                        <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                <span key={i} className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">{day}</span>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-y-4 text-center">
                            {calendarDays.map((date, i) => {
                                if (!date) return <div key={`empty-${i}`} />;

                                const past = isPast(date);
                                const selected = isSelected(date);

                                return (
                                    <button
                                        key={i}
                                        disabled={past}
                                        onClick={() => setSelectedDate(date)}
                                        className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-full text-xs font-bold transition-all
                                            ${selected ? 'bg-[#F05578] text-white shadow-lg shadow-pink-100' :
                                                past ? 'text-gray-100 pointer-events-none' : 'text-[#2A2340] hover:bg-[#FEE7EC]'}`}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slots */}
                    <h2 className="text-base font-extrabold text-[#2A2340] mb-6 tracking-tight">Available Slots</h2>
                    <div className="flex flex-wrap gap-3">
                        {SLOTS.map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`px-5 py-3 rounded-2xl text-[11px] font-extrabold transition-all border
                                    ${selectedSlot === slot
                                        ? 'bg-[#F05578] text-white border-[#F05578] shadow-lg shadow-pink-100'
                                        : 'bg-white text-[#2A2340] border-[#F2E9E9] shadow-sm'}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fixed Continue Button - Fine-tuned position */}
            <div className="mt-8 flex justify-center sticky bottom-24 pb-8">
                <button
                    onClick={() => navigate('/doctor/confirmation')}
                    className="w-full max-w-2xl bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-[0_15px_35px_rgba(240,85,120,0.3)] hover:bg-[#E94D71] active:scale-[0.98] transition-all tracking-tight"
                >
                    CONTINUE
                </button>
            </div>
        </div>
    );
}
