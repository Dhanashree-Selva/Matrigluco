import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Droplets,
    Scale,
    Activity,
    Users,
    Thermometer,
    Baby,
    CheckCircle2,
    Camera,
    Info
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const C = {
    bg: "#FDF8F8",
    white: "#FFFFFF",
    coral: "#F47C7C",
    textDark: "#33334d",
    textMid: "#70708b",
    textLight: "#A0A0B0",
    border: "#F5EDED",
    pinkLight: "#FFF2F2",
};

export default function ManualEntry() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 7;

    const [formData, setFormData] = useState({
        glucose: "",
        weight: "",
        height: "",
        systolic: "",
        diastolic: "",
        familyHistory: false,
        insulin: "",
        pregnancyWeek: "",
        previousPregnancies: ""
    });

    const [bmi, setBmi] = useState(null);

    useEffect(() => {
        if (formData.weight && formData.height) {
            const h = parseFloat(formData.height) / 100;
            const w = parseFloat(formData.weight);
            if (h > 0) {
                setBmi((w / (h * h)).toFixed(1));
            }
        }
    }, [formData.weight, formData.height]);

    const handleContinue = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setStep(8); // Loading/Predicting state
        try {
            // 1. Get Prediction
            const response = await fetch("http://127.0.0.1:8000/api/prediction/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pregnancies: Number(formData.previousPregnancies) || 0,
                    glucose: Number(formData.glucose) || 95,
                    blood_pressure: Number(formData.systolic) || 70,
                    skin_thickness: 20,
                    insulin: Number(formData.insulin) || 0,
                    bmi: Number(bmi) || 25,
                    diabetes_pedigree: formData.familyHistory ? 0.8 : 0.2,
                    age: 30, // Mock age or fetch from profile
                }),
            });

            const predData = await response.json();

            // 2. Save Tracking Data to Supabase via API
            const { data: { user } } = await supabase.auth.getUser();

            await fetch("http://127.0.0.1:8000/api/tracking/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    glucose: Number(formData.glucose) || 95,
                    bmi: Number(bmi) || 25,
                    prediction_result: predData.prediction_result,
                    risk_level: predData.risk_level,
                    probability_score: predData.probability_score,
                }),
            });

            // 3. Update User Metadata (week/pregnancies)
            if (user) {
                await supabase.auth.updateUser({
                    data: {
                        pregnancy_week: formData.pregnancyWeek,
                        previous_pregnancies: formData.previousPregnancies
                    }
                });
            }

            // 4. Navigate to Result
            navigate("/prediction", { state: { manualResult: predData } });

        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to process prediction. Please try again.");
            setStep(totalSteps);
        }
    };

    const renderHeader = () => (
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-50">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
                    className="p-2.5 bg-white rounded-full shadow-sm border border-gray-100 italic"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h3 className="text-sm font-extrabold text-gray-800">Step {step} of 9</h3>
                <div className="w-10"></div>
            </div>
            <div className="h-1.5 w-full bg-pink-50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    className="h-full bg-pink-500"
                />
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <StepWrapper
                        icon={Droplets}
                        title="Fasting Glucose"
                        sub="Enter your most recent fasting blood sugar reading."
                        badge="Scan report instead"
                        onBadgeClick={() => navigate("/prediction")}
                    >
                        <CustomInput
                            value={formData.glucose}
                            onChange={(v) => setFormData({ ...formData, glucose: v })}
                            unit="mg/dL"
                            placeholder="e.g. 95"
                        />
                        <InfoCard text="Normal range during pregnancy is typically below 95 mg/dL." />
                    </StepWrapper>
                );
            case 2:
                return (
                    <StepWrapper
                        icon={Scale}
                        title="Body Metrics"
                        sub="We use this to calculate your current BMI."
                    >
                        <div className="space-y-6">
                            <LabelInput
                                label="Weight (kg)"
                                value={formData.weight}
                                onChange={(v) => setFormData({ ...formData, weight: v })}
                                placeholder="e.g. 65"
                            />
                            <LabelInput
                                label="Height (cm)"
                                value={formData.height}
                                onChange={(v) => setFormData({ ...formData, height: v })}
                                placeholder="e.g. 165"
                            />
                            {bmi && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-2xl flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-800">Your Calculated BMI</span>
                                    <span className="text-lg font-extrabold text-blue-600">{bmi}</span>
                                </div>
                            )}
                        </div>
                    </StepWrapper>
                );
            case 3:
                return (
                    <StepWrapper
                        icon={Activity}
                        title="Blood Pressure"
                        sub="Systolic and diastolic readings are required."
                    >
                        <div className="space-y-6">
                            <LabelInput
                                label="Systolic (mmHg)"
                                value={formData.systolic}
                                onChange={(v) => setFormData({ ...formData, systolic: v })}
                                placeholder="e.g. 120"
                            />
                            <LabelInput
                                label="Diastolic (mmHg)"
                                value={formData.diastolic}
                                onChange={(v) => setFormData({ ...formData, diastolic: v })}
                                placeholder="e.g. 80"
                            />
                        </div>
                    </StepWrapper>
                );
            case 4:
                return (
                    <StepWrapper
                        icon={Users}
                        title="Family History"
                        sub="Does your immediate family have a history of diabetes?"
                    >
                        <div className="flex flex-col gap-4">
                            <ToggleButton
                                label="Diabetes History"
                                active={formData.familyHistory}
                                onToggle={() => setFormData({ ...formData, familyHistory: !formData.familyHistory })}
                            />
                        </div>
                    </StepWrapper>
                );
            case 5:
                return (
                    <StepWrapper
                        icon={Thermometer}
                        title="Insulin Level"
                        sub="Optional: Enter your current insulin level if known."
                    >
                        <CustomInput
                            value={formData.insulin}
                            onChange={(v) => setFormData({ ...formData, insulin: v })}
                            unit="mu U/ml"
                            placeholder="e.g. 15"
                        />
                    </StepWrapper>
                );
            case 6:
                return (
                    <StepWrapper
                        icon={Baby}
                        title="Pregnancy Details"
                        sub="Information about your current and past pregnancies."
                    >
                        <div className="space-y-6">
                            <LabelInput
                                label="Current Week"
                                value={formData.pregnancyWeek}
                                onChange={(v) => setFormData({ ...formData, pregnancyWeek: v })}
                                placeholder="e.g. 24"
                            />
                            <LabelInput
                                label="Previous Pregnancies"
                                value={formData.previousPregnancies}
                                onChange={(v) => setFormData({ ...formData, previousPregnancies: v })}
                                placeholder="e.g. 1"
                            />
                        </div>
                    </StepWrapper>
                );
            case 7:
                return (
                    <StepWrapper
                        icon={CheckCircle2}
                        title="Review & Predict"
                        sub="Check your values before we run our AI analysis."
                    >
                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <ReviewRow label="Glucose" value={`${formData.glucose} mg/dL`} />
                            <ReviewRow label="BMI" value={bmi} />
                            <ReviewRow label="BP" value={`${formData.systolic}/${formData.diastolic}`} />
                            <ReviewRow label="History" value={formData.familyHistory ? "Yes" : "No"} />
                            <ReviewRow label="Week" value={formData.pregnancyWeek} />
                        </div>
                    </StepWrapper>
                );
            case 8:
                return (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-20 h-20 border-4 border-pink-50 border-t-pink-500 rounded-full animate-spin mb-8" />
                        <h2 className="text-xl font-extrabold text-gray-800 mb-2">Generating AI Prediction</h2>
                        <p className="text-sm text-gray-500 max-w-[200px]">We're analyzing your data using our medical models...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.bg }}>
            {renderHeader()}
            <div className="flex-1 p-6 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {step <= totalSteps && (
                    <div className="mt-8 pb-10">
                        <button
                            onClick={handleContinue}
                            className="w-full bg-pink-500 text-white font-bold py-5 rounded-[24px] shadow-2xl shadow-pink-100 hover:bg-pink-600 active:scale-[0.98] transition-all"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function StepWrapper({ icon: Icon, title, sub, children, badge, onBadgeClick }) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-[28px] flex items-center justify-center text-blue-500">
                    <Icon size={32} />
                </div>
                {badge && (
                    <button
                        onClick={onBadgeClick}
                        className="px-4 py-2 bg-pink-50 text-pink-500 text-[10px] font-extrabold rounded-full uppercase tracking-wider"
                    >
                        {badge}
                    </button>
                )}
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{title}</h2>
            <p className="text-sm font-semibold text-gray-400 leading-relaxed mb-10">{sub}</p>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

function CustomInput({ value, onChange, unit, placeholder }) {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-50 flex items-center justify-between mb-6 group focus-within:border-pink-200 transition-all">
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent text-3xl font-extrabold text-gray-800 outline-none w-full placeholder:text-gray-100"
            />
            <span className="text-gray-400 font-bold ml-4">{unit}</span>
        </div>
    );
}

function LabelInput({ label, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-widest mb-3 ml-1">{label}</label>
            <input
                type="number"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white rounded-[20px] py-4 px-6 text-lg font-bold text-gray-700 outline-none border border-gray-50 shadow-sm focus:border-pink-200 transition-all"
            />
        </div>
    );
}

function ToggleButton({ label, active, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all ${active ? 'bg-pink-50 border-pink-100' : 'bg-white border-gray-50'}`}
        >
            <span className="font-bold text-gray-700">{label}</span>
            <div className={`w-12 h-6 rounded-full relative transition-all ${active ? 'bg-pink-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
            </div>
        </button>
    );
}

function InfoCard({ text }) {
    return (
        <div className="p-5 bg-white rounded-3xl border border-gray-100 shadow-sm flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-gray-400" />
            </div>
            <p className="text-[11px] font-semibold text-gray-400 leading-relaxed italic">{text}</p>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-50 last:border-b-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="font-extrabold text-gray-800">{value || "—"}</span>
        </div>
    );
}
