import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';
import { authApi, profilesApi } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Security() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [showPassword, setShowPassword] = useState(false);

    // Form states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Toggle states
    const [tfaActive, setTfaActive] = useState(false);
    const [logsActive, setLogsActive] = useState(true);

    useEffect(() => {
        fetchUserPreferences();
    }, []);

    const fetchUserPreferences = async () => {
        try {
            const user = await authApi.getCurrentUser();
            if (user) {
                setTfaActive(user.two_factor_auth || user.user_metadata?.two_factor_auth || false);
                setLogsActive(user.security_logs !== undefined ? user.security_logs : true);
            }
        } catch (err) {
            console.error("Fetch security preferences error:", err);
        } finally {
            setFetching(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            setMessage({ text: "Password must be at least 6 characters.", type: "error" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await profilesApi.updateProfile({
                password: newPassword
            });
            setMessage({ text: "Password updated successfully!", type: "success" });
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        } catch (error) {
            setMessage({ text: "Error: " + (error.response?.data?.error?.message || error.message), type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const togglePreference = async (key, currentValue) => {
        const newValue = !currentValue;
        if (key === 'tfa') setTfaActive(newValue);
        else setLogsActive(newValue);

        try {
            await profilesApi.updateProfile({
                [key === 'tfa' ? 'two_factor_auth' : 'security_logs']: newValue
            });
        } catch (error) {
            setMessage({ text: "Failed to update preference: " + (error.response?.data?.error?.message || error.message), type: "error" });
            if (key === 'tfa') setTfaActive(currentValue);
            else setLogsActive(currentValue);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-md animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-24 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Account Security</h1>
            </div>

            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`mb-6 p-4 rounded-md text-sm font-bold flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : null}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Information Card */}
            <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 mb-6 flex items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-md -mr-12 -mt-12 opacity-50" />
                <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Security Level: High</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Your account is protected</p>
                </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-md p-6 shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-blue-500" />
                    </div>
                    <h3 className="font-bold text-gray-800">Change Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full border border-gray-100 bg-gray-50/50 rounded-md px-4 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-gray-700"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Confirm Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full border border-gray-100 bg-gray-50/50 rounded-md px-4 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all font-medium text-gray-700"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-blue-100 mt-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-md animate-spin" />
                        ) : (
                            <><Save className="w-5 h-5" /> Update Password</>
                        )}
                    </button>
                </form>
            </div>

            {/* Extra Options */}
            <div className="mt-8 space-y-3">
                <SecurityOption
                    label="Two-Factor Authentication"
                    active={tfaActive}
                    onToggle={() => togglePreference('tfa', tfaActive)}
                />
                <SecurityOption
                    label="Security Activity Logs"
                    active={logsActive}
                    onToggle={() => togglePreference('logs', logsActive)}
                />
            </div>
        </div>
    );
}

function SecurityOption({ label, active, onToggle }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white rounded-md border border-gray-100 shadow-sm transition-all hover:border-blue-100">
            <span className="text-sm font-bold text-gray-700">{label}</span>
            <button
                onClick={onToggle}
                className={`w-12 h-6 rounded-md relative transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-100 ${active ? 'bg-green-500 shadow-inner' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-md shadow-md transition-all duration-200 ${active ? 'right-1' : 'left-1'}`} />
            </button>
        </div>
    );
}
