import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Plus, MoreVertical, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_CHATS, DOCTORS } from '../../data/medicalData';

export default function Chat() {
    const navigate = useNavigate();
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState(MOCK_CHATS);
    const scrollRef = useRef(null);

    const doc = DOCTORS[1]; // Dr. James Wilson (Endocrinologist)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!msg.trim()) return;
        const newMsg = {
            id: messages.length + 1,
            sender: 'user',
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, newMsg]);
        setMsg("");
    };

    return (
        <div className="flex flex-col h-screen bg-[#FDF8F8]">
            {/* Header */}
            <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-white rounded-md shadow-sm border border-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={doc.image} alt={doc.name} className="w-10 h-10 rounded-md object-cover" />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-md ${doc.status === 'Online' ? 'bg-green-500' : 'bg-amber-400'}`} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{doc.name}</h4>
                            <p className={`text-[10px] font-bold ${doc.status === 'Online' ? 'text-green-500' : 'text-amber-500'} uppercase tracking-widest flex items-center gap-1`}>
                                <ShieldCheck size={10} /> {doc.status}
                            </p>
                        </div>
                    </div>
                </div>
                <button className="p-2 text-gray-400"><MoreVertical size={20} /></button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div className="text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md">Today</span>
                </div>
                {messages.map((m) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={m.id}
                        className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] px-4 py-3 rounded-[24px] text-sm font-medium leading-relaxed ${m.sender === 'user' ? 'bg-pink-500 text-white rounded-tr-none shadow-md shadow-pink-100' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'}`}>
                            {m.text}
                            <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-tighter opacity-60 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>{m.time}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-gray-100 pb-10">
                <div className="flex bg-gray-50 rounded-[28px] items-center px-2.5 py-2.5 gap-2 border border-gray-100 shadow-inner">
                    <button className="w-10 h-10 bg-white shadow-sm rounded-md flex items-center justify-center text-gray-400 group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <input
                        type="text"
                        placeholder="Discuss health metrics..."
                        className="flex-1 bg-transparent py-3 px-2 outline-none font-medium text-gray-700"
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="w-12 h-12 bg-pink-500 rounded-md flex items-center justify-center text-white shadow-lg shadow-pink-100 active:scale-95 transition-all"
                    >
                        <Send size={20} fill="white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
