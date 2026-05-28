import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, MoreVertical, Signal, Activity, Clock } from 'lucide-react';

export default function VideoCall() {
    const navigate = useNavigate();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setTimer(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#2A2340] relative overflow-hidden font-sans">
            {/* Background "Video" Mock */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=1000"
                    className="w-full h-full object-cover opacity-60 grayscale-[20%]"
                    alt="Doctor"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#2A2340]/40 via-transparent to-[#2A2340]/80" />
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-20">
                <div className="flex gap-4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#F05578] shadow-lg">
                            <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100" className="w-full h-full object-cover" alt="Dr Sarah" />
                        </div>
                        <div>
                            <h3 className="text-white font-extrabold text-sm tracking-tight">Dr. Sarah Jenkins</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[#9E8A8C] text-[10px] font-bold uppercase tracking-widest">Consulting Now</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <StatusBadge icon={Signal} text="Excellent" color="text-green-400" />
                    <StatusBadge icon={Clock} text={formatTime(timer)} color="text-white" />
                </div>
            </div>

            {/* Floating Patient View */}
            <div className="absolute top-48 right-8 w-32 h-44 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl z-20">
                <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"
                    className="w-full h-full object-cover opacity-80"
                    alt="Patient"
                />
                <div className="absolute bottom-3 left-3 bg-[#F05578] px-2 py-0.5 rounded-lg text-[8px] font-extrabold text-white">YOU</div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
                <ControlBtn
                    icon={isMuted ? MicOff : Mic}
                    isActive={!isMuted}
                    onClick={() => setIsMuted(!isMuted)}
                />

                <button
                    onClick={() => navigate(-1)}
                    className="w-20 h-20 bg-[#F05578] rounded-[28px] flex items-center justify-center text-white shadow-[0_15px_35px_rgba(240,85,120,0.4)] hover:scale-105 active:scale-95 transition-all"
                >
                    <PhoneOff size={32} />
                </button>

                <ControlBtn
                    icon={isVideoOff ? VideoOff : VideoIcon}
                    isActive={!isVideoOff}
                    onClick={() => setIsVideoOff(!isVideoOff)}
                />
            </div>

            {/* Overlay Info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-white/5 backdrop-blur-md px-5 py-2 rounded-2xl flex items-center gap-3 border border-white/5">
                    <ShieldCheck size={14} className="text-green-400" />
                    <span className="text-[#9E8A8C] text-[9px] font-bold uppercase tracking-widest">End-to-End Encrypted Secure Line</span>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ icon: Icon, text, color }) {
    return (
        <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/5 animate-in slide-in-from-left duration-500">
            <Icon size={14} className={color} />
            <span className="text-white text-[9px] font-bold tracking-tight uppercase">{text}</span>
        </div>
    );
}

function ControlBtn({ icon: Icon, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#F05578] text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 text-white hover:bg-white/10 hover:-translate-y-1'}`}
        >
            <Icon size={22} fill={isActive ? "currentColor" : "none"} />
        </button>
    );
}

function ShieldCheck({ size, className }) {
    return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
}
