import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Upload,
    Camera,
    ShieldCheck,
    FileText,
    Image as ImageIcon,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    X,
    Zap
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function DiabetesPrediction() {
    const navigate = useNavigate();
    const location = useLocation();

    // Flow Steps: 0: Home, 1: Choose File, 2: OCR Loading, 3: Form, 4: Result, 5: Scanner, 6: Preview
    const [flowStep, setFlowStep] = useState(0);

    // Camera States
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const canvasRef = useRef(null);

    // OCR & Upload states
    const fileInputRef = useRef(null);
    const scanInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadType, setUploadType] = useState('doc'); // 'doc' or 'image'

    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        age: "28",
        bmi: "",
        glucose: "",
        hba1c: "",
        bloodPressure: "70",
        gestationalDiabetes: false,
        familyHistory: false,
    });

    const [extractionProgress, setExtractionProgress] = useState(0);
    const [extractedFields, setExtractedFields] = useState([]);
    const [recentReports, setRecentReports] = useState([]);

    useEffect(() => {
        // If navigated from ManualEntry with a prediction result, show it directly
        const incoming = location.state?.manualResult;
        if (incoming) {
            setResult({
                score: incoming.probability_score,
                level: incoming.risk_level,
                message: incoming.prediction_result,
            });
            setFlowStep(4);
        }
        fetchReports();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (flowStep === 5 && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [flowStep, stream]);

    const startCamera = async () => {
        try {
            setFlowStep(5);
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(newStream);
        } catch (err) {
            console.error("Camera error:", err);
            alert("Camera access unavailable. Upload a report instead.");
            setFlowStep(0);
            fileInputRef.current?.click();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);
            setFlowStep(6);
            stopCamera();
        }
    };

    const fetchReports = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', user.id)
                .order('uploaded_at', { ascending: false });

            if (!error) {
                setRecentReports(data || []);
            }
        } catch (err) {
            console.error("Error fetching reports:", err);
        }
    };

    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setCapturedImage(e.target.result);
            setFlowStep(6);
            stopCamera();
        };
        reader.readAsDataURL(file);
    };

    const processOCR = async (fileOrDataUrl) => {
        setFlowStep(2);
        setIsUploading(true);
        setExtractionProgress(10);

        const dataForm = new FormData();
        let fileToUpload = fileOrDataUrl;

        // If it's a base64 string from camera
        if (typeof fileOrDataUrl === 'string') {
            const res = await fetch(fileOrDataUrl);
            const blob = await res.blob();
            fileToUpload = new File([blob], "captured_report.jpg", { type: "image/jpeg" });
        }

        dataForm.append("file", fileToUpload);

        try {
            // Simulated progress for better UX
            const progressInterval = setInterval(() => {
                setExtractionProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 400);

            const response = await fetch(
                `${API_BASE_URL}/api/reports/`, {
                method: "POST",
                body: dataForm,
            });
            const data = await response.json();
            console.log("OCR API Response:", data);
            console.log("Extracted Values Payload:", data.health_data);

            clearInterval(progressInterval);
            setExtractionProgress(100);

            if (response.ok && data.health_data) {
                // Save to Supabase
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const fileExt = fileToUpload.name.split('.').pop();
                    const uniqueId = crypto.randomUUID ? crypto.randomUUID() : Date.now();
                    const fileName = `${user.id}/${uniqueId}.${fileExt}`;

                    const { data: storageData, error: storageError } = await supabase.storage
                        .from('medical_reports')
                        .upload(fileName, fileToUpload, { upsert: true });

                    if (storageError) {
                        console.log("Supabase Storage Error:", storageError);
                    }

                    if (storageData) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('medical_reports')
                            .getPublicUrl(fileName);

                        const { data: insertData, error: insertError } = await supabase
                            .from('reports')
                            .insert({
                                user_id: user.id,
                                file_url: publicUrl,
                                extracted_values: data.health_data,
                                uploaded_at: new Date().toISOString()
                            })
                            .select();

                        if (insertError) {
                            console.log("Supabase Insert Error:", JSON.stringify(insertError, null, 2));
                            console.log("Insert payload was:", {
                                user_id: user.id,
                                file_url: publicUrl,
                                extracted_values: data.health_data
                            });
                        } else {
                            console.log("Report inserted successfully:", insertData);
                        }
                        fetchReports();
                    }
                }

                const glucoseExtracted = Math.max(
                    data.health_data.glucose_fasting || 0,
                    data.health_data.glucose_pp || 0
                );

                const found = [];
                if (glucoseExtracted) found.push('Glucose');
                if (data.health_data.hba1c) found.push('HbA1c');
                if (data.health_data.bmi) found.push('BMI');

                setExtractedFields(found);

                const updatedFormData = {
                    ...formData,
                    glucose: glucoseExtracted || formData.glucose,
                    bmi: data.health_data.bmi || formData.bmi,
                    hba1c: data.health_data.hba1c || formData.hba1c,
                };
                setFormData(updatedFormData);
                console.log("Form State After Mapping:", updatedFormData);

                setTimeout(() => setFlowStep(3), 1500);
            } else {
                alert("Could not extract data automatically. Please enter values manually.");
                setFlowStep(3);
            }
        } catch (error) {
            console.error("OCR Error:", error);
            alert("OCR Service unavailable. Redirecting to manual entry.");
            setFlowStep(3);
        } finally {
            setIsUploading(false);
        }
    };

    const handlePredict = async () => {
        try {
            setFlowStep(2); // Show loading during prediction too
            setExtractionProgress(30);

            const response = await fetch(`${API_BASE_URL}/api/prediction/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pregnancies: formData.gestationalDiabetes ? 1 : 0,
                    glucose: Number(formData.glucose) || 95,
                    blood_pressure: Number(formData.bloodPressure) || 70,
                    skin_thickness: 20,
                    insulin: 0,
                    bmi: Number(formData.bmi) || 25,
                    diabetes_pedigree: formData.familyHistory ? 0.8 : 0.2,
                    age: Number(formData.age) || 30,
                }),
            });

            const data = await response.json();
            setExtractionProgress(100);

            setResult({
                score: data.probability_score,
                level: data.risk_level,
                message: data.prediction_result,
            });

            // Save to tracking
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;

            await fetch(`${API_BASE_URL}/api/tracking/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    glucose: Number(formData.glucose) || 95,
                    bmi: Number(formData.bmi) || 25,
                    prediction_result: data.prediction_result,
                    risk_level: data.risk_level,
                    probability_score: data.probability_score,
                }),
            });

            setTimeout(() => setFlowStep(4), 800);
        } catch (error) {
            console.error("Prediction Error:", error);
            alert("Prediction failed.");
            setFlowStep(3);
        }
    };

    const nextStep = () => setFlowStep(prev => prev + 1);
    const prevStep = () => setFlowStep(prev => (prev > 0 ? prev - 1 : prev));

    return (
        <div className="min-h-screen bg-[#FDF8F8] flex flex-col">
            {/* Header */}
            <div className={`p-6 flex items-center gap-4 ${flowStep === 4 ? 'bg-transparent' : 'bg-white border-b border-[#F2E9E9]'}`}>
                <button onClick={() => flowStep === 0 ? navigate(-1) : prevStep()} className="p-2.5 bg-[#FDF8F8] rounded-full border border-[#F2E9E9] text-[#2A2340]">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-extrabold text-[#2A2340] tracking-tight">
                    {flowStep === 0 ? "Scan Report" :
                        flowStep === 1 ? "Choose File" :
                            flowStep === 2 ? "Processing" :
                                flowStep === 3 ? "Health Profile" : "Result"}
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {flowStep === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold text-[#2A2340] tracking-tight leading-tight">Extract Health Data</h2>
                                <p className="text-sm font-bold text-[#9E8A8C] leading-relaxed">
                                    Upload or scan your medical reports (lab results, ultrasound, prescriptions) to automatically extract your health data.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ActionCard
                                    icon={Upload}
                                    title="Upload File"
                                    subtitle="PDF, JPG, PNG"
                                    color="text-[#F05578]"
                                    onClick={() => { setUploadType('doc'); setFlowStep(1); }}
                                />
                                <ActionCard
                                    icon={Camera}
                                    title="Camera Scan"
                                    subtitle="Take a photo"
                                    color="text-[#8AB6FF]"
                                    onClick={startCamera}
                                />
                            </div>

                            <div className="bg-white rounded-[32px] p-6 border border-[#F2E9E9] shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#EAF6EE] rounded-[24px] flex items-center justify-center text-[#5C9B73]">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-extrabold text-[#2A2340]">Your data is secure</h4>
                                    <p className="text-[10px] font-bold text-[#9E8A8C] leading-relaxed uppercase tracking-widest mt-1">
                                        Reports are processed securely and never shared without permission.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-[#9E8A8C] uppercase tracking-widest ml-1">Recent Uploads</h3>
                                {recentReports.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentReports.map((report) => (
                                            <RecentFile
                                                key={report.id}
                                                name={report.file_url ? report.file_url.split('/').pop() : 'Medical Report'}
                                                date={new Date(report.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                onClick={() => window.open(report.file_url, '_blank')}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-[32px] p-10 border border-[#F2E9E9] text-center space-y-2">
                                        <div className="w-16 h-16 bg-[#FDF8F8] rounded-full flex items-center justify-center mx-auto text-[#F05578]/30">
                                            <FileText size={32} />
                                        </div>
                                        <h4 className="text-sm font-extrabold text-[#2A2340]">No reports uploaded yet</h4>
                                        <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest">Upload a report to get started</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {flowStep === 5 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] bg-[#0B0B0F] flex flex-col"
                        >
                            <div className="flex-grow relative flex items-center justify-center overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="absolute inset-0 w-full h-full object-cover grayscale-[20%] z-0"
                                />

                                {/* Scan Frame Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
                                        <div className="flex h-[450px]">
                                            <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
                                            <div className="w-[320px] relative">
                                                {/* Frame corners with glow */}
                                                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#5C9B73] rounded-tl-2xl shadow-[0_0_15px_#5C9B73]" />
                                                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#5C9B73] rounded-tr-2xl shadow-[0_0_15px_#5C9B73]" />
                                                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#5C9B73] rounded-bl-2xl shadow-[0_0_15px_#5C9B73]" />
                                                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#5C9B73] rounded-br-2xl shadow-[0_0_15px_#5C9B73]" />
                                            </div>
                                            <div className="flex-1 bg-black/40 backdrop-blur-[2px]" />
                                        </div>
                                        <div className="flex-1 bg-black/40 backdrop-blur-[2px] flex items-start justify-center pt-8">
                                            <div className="bg-white/10 backdrop-blur-xl px-6 py-2 rounded-full border border-white/10">
                                                <p className="text-white text-xs font-bold tracking-tight">Position your report inside the frame</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Actions */}
                                <div className="absolute top-8 left-0 right-0 px-8 flex justify-between items-center z-20">
                                    <button onClick={() => { stopCamera(); setFlowStep(0); }} className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10">
                                        <X size={24} />
                                    </button>
                                    <button className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10">
                                        <Zap size={20} className="fill-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Controls */}
                            <div className="h-[140px] bg-[#0B0B0F] px-10 flex items-center justify-between">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"
                                >
                                    <ImageIcon size={24} />
                                </button>

                                <button
                                    onClick={capturePhoto}
                                    className="w-20 h-20 bg-white rounded-full p-1 border-4 border-white/20 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="w-full h-full rounded-full bg-white border-2 border-[#0B0B0F]" />
                                </button>

                                <div className="w-12" />
                            </div>
                        </motion.div>
                    )}

                    {flowStep === 6 && (
                        <motion.div
                            key="step6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-[100] bg-[#FDF8F8] flex flex-col"
                        >
                            {/* Preview area — full-screen on mobile, centered card on desktop */}
                            <div className="flex-grow flex items-center justify-center p-4 md:p-8 overflow-hidden">
                                <div className="
                                    relative w-full bg-white border border-[#F2E9E9] overflow-hidden
                                    rounded-[40px] shadow-2xl
                                    aspect-[3/4]
                                    md:aspect-auto md:max-w-3xl md:max-h-[500px] md:w-full md:rounded-3xl md:shadow-sm
                                ">
                                    <img
                                        src={capturedImage}
                                        className="w-full h-full object-cover md:object-contain"
                                        alt="Captured"
                                    />

                                    {/* Crop adjustment guides */}
                                    <div className="absolute inset-6 border border-dashed border-white/40 pointer-events-none rounded-[32px]">
                                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg" />
                                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg" />
                                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg" />
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg" />
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons — always visible at bottom */}
                            <div className="p-6 md:p-8 space-y-4 bg-white rounded-t-[48px] md:rounded-t-3xl shadow-sm border-t border-[#F2E9E9] md:max-w-3xl md:mx-auto md:w-full">
                                <button
                                    onClick={() => { setCapturedImage(null); startCamera(); }}
                                    className="w-full bg-[#FDF8F8] text-[#2A2340] font-extrabold py-5 rounded-[24px] border border-[#F2E9E9] hover:border-[#F05578] transition-all"
                                >
                                    RETAKE PHOTO
                                </button>
                                <button
                                    onClick={() => processOCR(capturedImage)}
                                    className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100 hover:bg-[#E94D71] transition-all"
                                >
                                    USE PHOTO
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {flowStep === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            <div className="flex bg-white p-1 rounded-2xl border border-[#F2E9E9]">
                                <TabBtn active={uploadType === 'doc'} onClick={() => setUploadType('doc')}>Document</TabBtn>
                                <TabBtn active={uploadType === 'image'} onClick={() => setUploadType('image')}>Image</TabBtn>
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square bg-white rounded-[48px] border-2 border-dashed border-[#F2E9E9] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#F05578] transition-all"
                            >
                                <div className="w-20 h-20 bg-[#FDF8F8] rounded-[32px] flex items-center justify-center text-[#F05578] group-hover:scale-110 transition-transform">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <h4 className="text-lg font-extrabold text-[#2A2340]">Choose a file</h4>
                                    <p className="text-xs font-bold text-[#9E8A8C] mt-1">Drag and drop or browse files</p>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Badge>PDF</Badge>
                                    <Badge>JPG</Badge>
                                    <Badge>PNG</Badge>
                                    <Badge>HEIC</Badge>
                                </div>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100 hover:bg-[#E94D71] transition-all"
                            >
                                BROWSE FILES
                            </button>
                        </motion.div>
                    )}

                    {flowStep === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-6 h-full flex flex-col items-center justify-center text-center space-y-10"
                        >
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-[#FDF8F8] border-t-[#F05578] animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-[#F05578]">
                                    <Loader2 size={32} className="animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-2xl font-extrabold text-[#2A2340] tracking-tight">Extracting Data...</h2>
                                <p className="text-sm font-bold text-[#9E8A8C] uppercase tracking-widest leading-relaxed">
                                    Our AI is scanning your report for glucose, HbA1c, and BMI values.
                                </p>
                            </div>

                            <div className="w-full max-w-xs bg-white rounded-full h-3 overflow-hidden border border-[#F2E9E9]">
                                <motion.div
                                    className="bg-[#F05578] h-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${extractionProgress}%` }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {flowStep === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 space-y-8"
                        >
                            <div className="bg-[#EAF6EE] p-5 rounded-[32px] border border-[#F2E9E9] flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#5C9B73] shadow-sm">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-[#2A2340]">Extraction Successful</h4>
                                    <p className="text-[10px] font-bold text-[#5C9B73] uppercase tracking-widest mt-0.5">Found: {extractedFields.join(', ') || 'Manual Entry'}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <ModernInput label="Age" value={formData.age} onChange={(v) => setFormData({ ...formData, age: v })} />
                                    <ModernInput label="BMI" value={formData.bmi} onChange={(v) => setFormData({ ...formData, bmi: v })} placeholder="e.g. 24.5" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <ModernInput label="Glucose" value={formData.glucose} onChange={(v) => setFormData({ ...formData, glucose: v })} placeholder="e.g. 98" />
                                    <ModernInput label="HbA1c" value={formData.hba1c} onChange={(v) => setFormData({ ...formData, hba1c: v })} placeholder="e.g. 5.7" />
                                </div>
                                <ModernInput label="Blood Pressure" value={formData.bloodPressure} onChange={(v) => setFormData({ ...formData, bloodPressure: v })} placeholder="120/80" />

                                <div className="space-y-3 pt-4">
                                    <Toggle label="Gestational Diabetes History" active={formData.gestationalDiabetes} onClick={() => setFormData({ ...formData, gestationalDiabetes: !formData.gestationalDiabetes })} />
                                    <Toggle label="Family History of Diabetes" active={formData.familyHistory} onClick={() => setFormData({ ...formData, familyHistory: !formData.familyHistory })} />
                                </div>
                            </div>

                            <button
                                onClick={handlePredict}
                                className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100 hover:bg-[#E94D71] transition-all"
                            >
                                GENERATE PREDICTION
                            </button>
                        </motion.div>
                    )}

                    {flowStep === 4 && result && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-6 h-full flex flex-col items-center justify-center space-y-12"
                        >
                            <div className="relative text-center">
                                <div className={`w-64 h-64 rounded-full border-[12px] flex flex-col items-center justify-center ${result.level === 'High Risk' ? 'border-[#FDE8EC] text-[#E25B76]' : result.level === 'Moderate Risk' ? 'border-[#FFF4DD] text-[#D79B2E]' : 'border-[#EAF6EE] text-[#5C9B73]'}`}>
                                    <h4 className="text-6xl font-black tracking-tighter">{result.score}%</h4>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] mt-1">{result.level}</p>
                                </div>
                            </div>

                            <div className="text-center space-y-4 px-6">
                                <h2 className="text-3xl font-extrabold text-[#2A2340] tracking-tight leading-tight">
                                    {result.level === "High Risk" ? "Urgent Care Recommended" : result.level === "Moderate Risk" ? "Focus on Prevention" : "Excellent Health Status"}
                                </h2>
                                <p className="text-sm font-bold text-[#9E8A8C] leading-relaxed italic">
                                    "{result.message}"
                                </p>
                            </div>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={() => navigate('/doctor')}
                                    className="w-full bg-[#F05578] text-white font-extrabold py-5 rounded-[24px] shadow-lg shadow-pink-100"
                                >
                                    BOOK CONSULTATION
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-[#2A2340] font-extrabold py-5 rounded-[24px] border border-[#F2E9E9]"
                                >
                                    BACK TO DASHBOARD
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Elements */}
            <input type="file" accept=".pdf,image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelection} />
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={scanInputRef} onChange={handleFileSelection} />
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

function ActionCard({ icon: Icon, title, subtitle, color, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-white rounded-[32px] p-6 border border-[#F2E9E9] shadow-sm flex flex-col items-start gap-4 text-left hover:border-[#F05578] transition-all active:scale-95"
        >
            <div className={`w-12 h-12 rounded-2xl bg-[#FDF8F8] flex items-center justify-center ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-sm font-extrabold text-[#2A2340] leading-tight">{title}</h4>
                <p className="text-[10px] font-bold text-[#9E8A8C] uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
        </button>
    );
}

function RecentFile({ name, date, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white rounded-2xl p-4 border border-[#F2E9E9] flex items-center justify-between hover:border-[#F05578] transition-all active:scale-[0.98]"
        >
            <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-[#FDF8F8] rounded-xl flex items-center justify-center text-[#F05578]">
                    <FileText size={20} />
                </div>
                <div>
                    <h4 className="text-xs font-extrabold text-[#2A2340]">{name}</h4>
                    <p className="text-[9px] font-bold text-[#9E8A8C] mt-0.5">{date}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-[#9E8A8C]" />
        </button>
    );
}

function TabBtn({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-3 rounded-xl text-xs font-extrabold transition-all ${active ? 'bg-[#F05578] text-white shadow-md' : 'text-[#9E8A8C]'}`}
        >
            {children}
        </button>
    );
}

function Badge({ children }) {
    return <span className="px-3 py-1 bg-[#FDF8F8] rounded-lg text-[10px] font-bold text-[#F05578] border border-[#FEE7EC]">{children}</span>;
}

function ModernInput({ label, value, onChange, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-[#9E8A8C] uppercase tracking-[0.2em] ml-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-[#F2E9E9] rounded-2xl px-5 py-4 text-sm font-extrabold text-[#2A2340] focus:ring-2 focus:ring-[#F05578]/20 outline-none transition-all placeholder:text-gray-300"
            />
        </div>
    );
}

function Toggle({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-[#F2E9E9] transition-all"
        >
            <span className="text-xs font-extrabold text-[#2A2340]">{label}</span>
            <div className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-[#F05578]' : 'bg-[#F2E9E9]'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
            </div>
        </button>
    );
}