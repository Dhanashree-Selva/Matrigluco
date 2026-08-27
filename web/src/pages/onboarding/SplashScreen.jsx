import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function SplashScreen({ onFinish }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onFinish();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E97A8D]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                {/* Logo Container */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 0 0px rgba(255,255,255,0)",
                            "0 0 20px rgba(255,255,255,0.4)",
                            "0 0 0px rgba(255,255,255,0)"
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-24 h-24 bg-white rounded-[28px] flex items-center justify-center shadow-2xl mb-6"
                >
                    <Heart size={48} fill="#E97A8D" className="text-[#E97A8D]" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl font-black text-white tracking-tight"
                >
                    MatriGluco
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-white/80 text-sm font-bold mt-2 uppercase tracking-[0.2em]"
                >
                    Caring for two.
                </motion.p>
            </motion.div>

            {/* Subtle background circles */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 rounded-md blur-3xl" />
            <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-white/10 rounded-md blur-3xl" />
        </div>
    );
}
