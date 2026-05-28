import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Activity, User, Plus } from 'lucide-react';

export default function Navigation() {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'History', path: '/history', icon: ClipboardList },
        { name: 'CenterButton', path: '/manual-entry', isCenter: true },
        { name: 'Track', path: '/track', icon: Activity },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F2E9E9] z-50 md:sticky md:bottom-auto md:w-full pb-4 pt-1 shadow-[0_-4px_20px_rgba(42,35,64,0.03)]">
            <div className="flex justify-around items-center h-16 relative">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    if (item.isCenter) {
                        return (
                            <Link key={item.name} to={item.path} className="relative z-10 -mt-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F05578] to-[#E94D71] rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(240,85,120,0.4)] border-4 border-white active:scale-95 transition-all">
                                    <Plus className="w-9 h-9" strokeWidth={3} />
                                </div>
                            </Link>
                        );
                    }
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.name} to={item.path} className="flex flex-col items-center justify-center w-full h-full group">
                            <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#F05578] scale-110' : 'text-[#9E8A8C] group-hover:text-[#F05578]'}`} />
                            <span className={`text-[10px] mt-1.5 font-bold tracking-tight transition-colors ${isActive ? 'text-[#F05578]' : 'text-[#9E8A8C] group-hover:text-[#F05578]'}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
