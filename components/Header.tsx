import React, { useState, useRef, useEffect } from 'react';
import { useWorkie } from '../store/WorkieContext';
import { IconLogout, IconUser, IconSettings } from './icons';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
    const { state, dispatch } = useWorkie();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
    };
    
    const handleProfile = () => {
        setIsProfileModalOpen(true);
        setMenuOpen(false);
    };

    const handleSettings = () => {
        setIsSettingsModalOpen(true);
        setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <header>
                <div className="flex justify-between items-center">
                    <img src="https://res.cloudinary.com/dt2cxv6zw/image/upload/c_crop,w_320,h_180,ar_16:9/v1759421648/workie__1_-removebg-preview_uynvtc.png" alt="Workie Logo" className="w-32 h-auto" />
                    
                    {/* Controls on the Right */}
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={menuRef}>
                            <button onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden hover:ring-2 hover:ring-purple-300 transition">
                                {state.avatarUrl ? (
                                    <img 
                                        src={state.avatarUrl}
                                        alt="User Avatar" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <IconUser className="h-6 w-6 text-purple-500" />
                                    </div>
                                )}
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm text-gray-500">Signed in as</p>
                                            <p className="text-base font-semibold text-gray-800 truncate">{state.currentUser}</p>
                                        </div>
                                        <div className="py-1">
                                            <button onClick={handleProfile} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                                <IconUser className="h-5 w-5 text-gray-500" />
                                                <span>Profile</span>
                                            </button>
                                            <button onClick={handleSettings} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                                                <IconSettings className="h-5 w-5 text-gray-500" />
                                                <span>Settings</span>
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-100"></div>
                                        <div className="py-1">
                                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <IconLogout className="h-5 w-5" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Welcome Text below */}
                <div className="mt-4">
                    <p className="text-purple-700 text-lg drop-shadow-md">Welcome back, <span className="font-bold">{state.currentUser}</span>!</p>
                </div>
            </header>
            {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} />}
            {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        </>
    );
};

export default Header;
