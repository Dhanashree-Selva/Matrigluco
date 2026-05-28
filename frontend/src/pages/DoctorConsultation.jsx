import { ArrowLeft, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorConsultation() {
    const navigate = useNavigate();

    const doctors = [
        { name: "Dr. Emily Chen", spec: "Endocrinologist", rating: "4.9", image: "https://i.pravatar.cc/150?img=43" },
        { name: "Dr. Marcus Johnson", spec: "General Physician", rating: "4.8", image: "https://i.pravatar.cc/150?img=11" },
        { name: "Dr. Sarah Williams", spec: "Gynecologist", rating: "4.9", image: "https://i.pravatar.cc/150?img=20" },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
                <h1 className="text-xl font-bold text-gray-800">Consult a Doctor</h1>
            </div>

            <div className="bg-pink-500 rounded-3xl p-6 text-white mb-8 shadow-md relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                <h2 className="text-xl font-bold mb-2">Need Expert Advice?</h2>
                <p className="text-pink-100 text-sm mb-4 max-w-[200px]">Book a video consultation with top specialists.</p>
                <button className="bg-white text-pink-500 font-bold px-5 py-2 rounded-full text-sm">
                    Find a Doctor
                </button>
            </div>

            <h3 className="font-semibold text-gray-800 mb-4">Recommended Specialists</h3>
            <div className="space-y-4">
                {doctors.map((doc, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                        <img src={doc.image} alt={doc.name} className="w-14 h-14 rounded-full object-cover shadow-sm" />
                        <div className="flex-grow">
                            <h4 className="font-bold text-sm text-gray-800">{doc.name}</h4>
                            <p className="text-xs text-gray-500">{doc.spec}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs font-medium text-orange-500">
                                <span>★</span> {doc.rating}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100"><Video className="w-4 h-4" /></button>
                            <button className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-100"><MessageSquare className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
