import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, HeartHandshake, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ONBOARDING_STEPS = [
    {
        title: "Track every metric that matters",
        desc: "Easily log your glucose, blood pressure, and weight to stay on top of your health.",
        icon: Activity,
        bgColor: "bg-[#EAF6EE]",
        iconColor: "text-[#5C9B73]",
    },
    {
        title: "AI predicts your risk",
        desc: "Our advanced AI analyzes your data to predict potential health risks before they arise.",
        icon: Brain,
        bgColor: "bg-[#FDECEC]",
        iconColor: "text-[#E97A8D]",
    },
    {
        title: "Personalized care for mom & baby",
        desc: "Get tailored health advice, diet recommendations, and reminders for your special journey.",
        icon: HeartHandshake,
        bgColor: "bg-[#FFF4DD]",
        iconColor: "text-[#D79B2E]",
    }
];

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (step < ONBOARDING_STEPS.length - 1) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        localStorage.setItem('onboarding_completed', 'true');
        onComplete();
    };

    const currentData = ONBOARDING_STEPS[step];

    return (
        <div className="min-h-screen bg-[#FAF6F3] flex flex-col items-center justify-between p-8 pb-12 overflow-hidden">
            <div className="w-full flex justify-end">
                <button
                    onClick={completeOnboarding}
                    className="text-[10px] font-black text-[#2A223B]/40 uppercase tracking-[0.2em] hover:text-[#E97A8D] transition-colors"
                >
                    Skip
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[320px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Icon Container */}
                        <div className={`w-48 h-48 ${currentData.bgColor} rounded-full flex items-center justify-center mb-12 shadow-lg shadow-black/5`}>
                            <currentData.icon size={80} strokeWidth={1.5} className={currentData.iconColor} />
                        </div>

                        <h2 className="text-[28px] font-black text-[#2A223B] leading-tight mb-4 px-2">
                            {currentData.title}
                        </h2>

                        <p className="text-sm font-bold text-[#2A223B]/60 leading-relaxed px-4">
                            {currentData.desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="w-full max-w-[320px] flex flex-col items-center gap-10">
                {/* Dots */}
                <div className="flex gap-2.5">
                    {ONBOARDING_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-[#E97A8D]" : "w-1.5 bg-[#E97A8D]/20"
                                }`}
                        />
                    ))}
                </div>

                {/* Primary Button */}
                <button
                    onClick={handleNext}
                    className="w-full bg-[#E97A8D] text-white py-5 rounded-[24px] font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-[#E97A8D]/20 active:scale-[0.98] transition-all"
                >
                    <span>{step === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}</span>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
