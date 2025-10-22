import React, { useMemo, useState } from 'react';
import { useWorkie } from '../store/WorkieContext';
import { IconClose, IconTrendingUp, IconClock, IconStar, IconChevronLeft, IconChevronRight, IconEdit, IconUser } from './icons';
import { WorkLog } from '../types';

interface ProfileModalProps {
    onClose: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className={`bg-opacity-50 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm ${color}`}>
        <div className="w-10 h-10 mb-2">{icon}</div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-800 truncate">{value}</p>
    </div>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { state, dispatch } = useWorkie();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(state.currentUser || '');
    const [nameError, setNameError] = useState<string | null>(null);

    const handlePrevMonth = () => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setSelectedDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    };

    const handleNameSave = () => {
        const trimmedName = editedName.trim();
        if (trimmedName.length < 3) {
            setNameError('Name must be at least 3 characters.');
            return;
        }

        if (trimmedName && trimmedName !== state.currentUser) {
            dispatch({ 
                type: 'RENAME_USER', 
                payload: { oldName: state.currentUser!, newName: trimmedName }
            });
        }
        setNameError(null);
        setIsEditingName(false);
    };
    
    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setEditedName(state.currentUser || '');
            setIsEditingName(false);
            setNameError(null);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                dispatch({ type: 'UPDATE_AVATAR', payload: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };


    const monthlyStats = useMemo(() => {
        if (!state.logs) return { totalEarnings: "0.00", totalHours: "0.00", mostFrequentWorkType: 'N/A' };

        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();

        const monthlyLogs = state.logs.filter(log => {
            // Ensure log.date is parsed as a local date to avoid timezone issues
            const logDate = new Date(log.date + 'T00:00:00');
            return logDate.getMonth() === selectedMonth && logDate.getFullYear() === selectedYear;
        });

        if (monthlyLogs.length === 0) {
            return { totalEarnings: "0.00", totalHours: "0.00", mostFrequentWorkType: 'None' };
        }

        const totalEarnings = monthlyLogs.reduce((sum, log) => sum + log.pay, 0);
        const totalHours = monthlyLogs.reduce((sum, log) => sum + log.hoursWorked, 0);

        const workTypeCounts = monthlyLogs.reduce((acc, log) => {
            const type = log.workType === 'Custom' ? log.customWorkType || 'Custom' : log.workType;
            if (type) {
                acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        
        const mostFrequentWorkType = Object.keys(workTypeCounts).length > 0
            // FIX: Explicitly convert array values to numbers before subtraction to resolve
            // type inference issues in the sort function.
            ? Object.entries(workTypeCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0][0]
            : 'None';

        return {
            totalEarnings: totalEarnings.toFixed(2),
            totalHours: totalHours.toFixed(2),
            mostFrequentWorkType,
        };
    }, [state.logs, selectedDate]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
                <style>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.2s ease-out forwards;
                    }
                `}</style>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                
                <div className="flex flex-col items-center -mt-16">
                    <div className="relative group w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 ring-4 ring-white overflow-hidden">
                        {state.avatarUrl ? (
                            <img 
                                src={state.avatarUrl} 
                                alt="User Avatar" 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                                <IconUser className="h-12 w-12 text-purple-500" />
                            </div>
                        )}
                        <label 
                            htmlFor="avatar-upload" 
                            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
                        >
                            <span className="text-white opacity-0 group-hover:opacity-100">Change</span>
                        </label>
                        <input 
                            type="file" 
                            id="avatar-upload" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="flex flex-col items-center">
                         <div className="flex items-center gap-2">
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => {
                                        setEditedName(e.target.value);
                                        if (nameError) setNameError(null);
                                    }}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleNameKeyDown}
                                    className={`text-3xl font-bold text-gray-800 bg-transparent border-b-2 ${nameError ? 'border-red-400' : 'border-purple-300'} focus:outline-none text-center`}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-800">{state.currentUser}</h2>
                                    <button onClick={() => { setIsEditingName(true); setNameError(null); }} className="text-gray-400 hover:text-gray-600 p-1">
                                        <IconEdit className="h-5 w-5" />
                                    </button>
                                </>
                            )}
                        </div>
                        {isEditingName && nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                    </div>

                    <p className="text-gray-500 mt-1">Monthly Summary</p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition" aria-label="Previous month">
                        <IconChevronLeft className="h-6 w-6 text-gray-500" />
                    </button>
                    <p className="text-lg font-semibold text-gray-700 w-40 text-center">
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </p>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition" aria-label="Next month">
                        <IconChevronRight className="h-6 w-6 text-gray-500" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <StatCard 
                        icon={<IconTrendingUp className="text-green-500"/>}
                        title="Monthly Earnings"
                        value={`${state.settings.currency}${monthlyStats.totalEarnings}`}
                        color="bg-green-100"
                    />
                     <StatCard 
                        icon={<IconClock className="text-blue-500"/>}
                        title="Total Hours"
                        value={monthlyStats.totalHours}
                        color="bg-blue-100"
                    />
                     <StatCard 
                        icon={<IconStar className="text-yellow-500"/>}
                        title="Most Frequent Task"
                        value={monthlyStats.mostFrequentWorkType}
                        color="bg-yellow-100"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;