import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, User, Info, MessageCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOCTORS } from '../../data/medicalData';
import { supabase } from '../../supabaseClient';

const SLOTS = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];
const TYPES = ["Video", "In-person"];

export default function BookAppointment() {
    const navigate = useNavigate();
    const { id } = useParams();
    const doctor = DOCTORS.find(d => d.id === parseInt(id)) || DOCTORS[0];

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState("10:30 AM");

    // Form States
    const [patientName, setPatientName] = useState('');
    const [consultationType, setConsultationType] = useState('Video');
    const [symptoms, setSymptoms] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const offset = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        for (let i = 0; i < offset; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
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

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const handleBooking = async () => {
        if (!patientName.trim()) {
            setError("Please enter patient name");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authenticated user");

            const { error: dbError } = await supabase
                .from('doctor_appointments')
                .insert([{
                    user_id: user.id,
                    patient_name: patientName,
                    doctor_name: doctor.name,
                    consultation_type: consultationType,
                    appointment_date: selectedDate.toISOString().split('T')[0],
                    appointment_time: selectedSlot,
                    symptoms: symptoms,
                    status: 'booked'
                }]);

            if (dbError) throw dbError;

            navigate('/doctor/confirmation');
        } catch (err) {
            console.error("Booking Error:", err);
            setError(err.message || "Failed to book appointment. Please make sure the table exists.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F8] relative">
            <div className="max-w-6xl mx-auto pb-[120px]">
                {/* Header */}
                <div className="flex items-center px-6 py-8 bg-[#FDF8F8]">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#F2E9E9] hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#2A2340]" />
                    </button>
                    <h1 className="flex-1 text-center text-2xl font-extrabold text-[#2A2340] -ml-12 tracking-tight">Book Appointment</h1>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Left Column: Date & Time */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-lg font-extrabold text-[#2A2340] mb-6 tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#FEE7EC] text-[#F05578] flex items-center justify-center text-sm">1</span>
                                Select Date
                            </h2>

                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F2E9E9]">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-xl font-extrabold text-[#2A2340] tracking-tight">{monthName} {year}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-[#FDF8F8] border border-[#F2E9E9] flex items-center justify-center text-[#9E8A8C] hover:bg-[#FEE7EC] hover:text-[#F05578] transition-all">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-[#FDF8F8] border border-[#F2E9E9] flex items-center justify-center text-[#9E8A8C] hover:bg-[#FEE7EC] hover:text-[#F05578] transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-y-4 text-center mb-6">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                        <span key={i} className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">{day}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-y-6 text-center">
                                    {calendarDays.map((date, i) => {
                                        if (!date) return <div key={`empty-${i}`} />;
                                        const past = isPast(date);
                                        const selected = isSelected(date);

                                        return (
                                            <button
                                                key={i}
                                                disabled={past}
                                                onClick={() => setSelectedDate(date)}
                                                className={`relative w-10 h-10 mx-auto flex items-center justify-center rounded-2xl text-sm font-bold transition-all
                                                    ${selected ? 'bg-[#F05578] text-white shadow-xl shadow-pink-100' :
                                                        past ? 'text-gray-200 pointer-events-none' : 'text-[#2A2340] hover:bg-[#FEE7EC] hover:text-[#F05578]'}`}
                                            >
                                                {date.getDate()}
                                                {selected && <motion.div layoutId="activeDate" className="absolute inset-0 border-2 border-[#F05578] rounded-2xl" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-extrabold text-[#2A2340] mb-6 tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#F0F4FF] text-[#5C89FF] flex items-center justify-center text-sm">2</span>
                                Available Time
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {SLOTS.map((slot) => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-4 rounded-2xl text-[11px] font-extrabold transition-all border
                                            ${selectedSlot === slot
                                                ? 'bg-[#F05578] text-white border-[#F05578] shadow-lg shadow-pink-100'
                                                : 'bg-white text-[#2A2340] border-[#F2E9E9] hover:border-[#F05578]'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Form Details */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-lg font-extrabold text-[#2A2340] mb-6 tracking-tight flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#5C9B73] flex items-center justify-center text-sm">3</span>
                                Appointment Details
                            </h2>

                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-[#F2E9E9] space-y-6">
                                {/* Doctor Card Mini */}
                                <div className="flex items-center gap-4 p-4 bg-[#FDF8F8] rounded-3xl border border-[#F2E9E9] mb-4">
                                    <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                                    <div>
                                        <h4 className="text-sm font-extrabold text-[#2A2340]">{doctor.name}</h4>
                                        <p className="text-[10px] font-bold text-[#F05578] uppercase tracking-wider">{doctor.specialization}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-[#9E8A8C] uppercase tracking-widest ml-1">Patient Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F05578]" />
                                        <input
                                            type="text"
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder="Full name of patient"
                                            className="w-full bg-[#FAFAFA] rounded-2xl py-4 pl-12 pr-4 outline-none border border-[#F2E9E9] font-bold text-sm text-[#2A2340] focus:ring-4 focus:ring-[#FEE7EC] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-[#9E8A8C] uppercase tracking-widest ml-1">Consultation Type</label>
                                    <div className="flex gap-3">
                                        {TYPES.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setConsultationType(type)}
                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-extrabold transition-all border
                                                    ${consultationType === type ? 'bg-[#2A2340] text-white border-[#2A2340] shadow-md' : 'bg-[#FAFAFA] text-[#9E8A8C] border-[#F2E9E9]'}`}
                                            >
                                                {type === 'Video' ? 'Video Call' : 'In-person'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-[#9E8A8C] uppercase tracking-widest ml-1">Symptoms (Optional)</label>
                                    <div className="relative">
                                        <Info className="absolute left-4 top-4 w-4 h-4 text-[#F05578]" />
                                        <textarea
                                            value={symptoms}
                                            onChange={(e) => setSymptoms(e.target.value)}
                                            placeholder="Briefly describe symptoms..."
                                            rows="3"
                                            className="w-full bg-[#FAFAFA] rounded-2xl py-4 pl-12 pr-4 outline-none border border-[#F2E9E9] font-bold text-sm text-[#2A2340] focus:ring-4 focus:ring-[#FEE7EC] transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl text-red-500 text-[10px] font-bold">
                                        <AlertCircle size={14} />
                                        {error}
                                    </motion.div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Bottom Bar Container */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-[#F2E9E9] z-50">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-[0.2em] mb-1">Selected Schedule</p>
                        <h4 className="text-sm font-extrabold text-[#2A2340]">
                            {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {selectedSlot}
                        </h4>
                    </div>
                    <button
                        onClick={handleBooking}
                        disabled={isSubmitting}
                        className={`flex-1 sm:max-w-md bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-xl shadow-pink-100 hover:bg-[#E94D71] active:scale-[0.98] transition-all tracking-widest text-[10px] flex items-center justify-center gap-3 disabled:opacity-70`}
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check size={16} />
                                CONFIRM BOOKING
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
