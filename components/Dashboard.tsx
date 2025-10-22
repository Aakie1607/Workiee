
import React, { useState, useMemo, useEffect } from 'react';
import { useWorkie } from '../store/WorkieContext';
import { WorkLog } from '../types';
import LogModal from './LogModal';
import BentoDashboard from './BentoDashboard';
import WorkLogTable from './WorkLogTable';
import Header from './Header';
import { addDays, formatDate, getWeekStartDate } from '../utils/dateUtils';
import { IconPlus, IconChevronLeft, IconChevronRight, IconDownload } from './icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CelebrationPopup from './CelebrationPopup';
import OnboardingTour from './OnboardingTour';
import { exportToPdf } from '../utils/csvUtils';

const Dashboard: React.FC = () => {
    const { state } = useWorkie();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
    const [deletingLog, setDeletingLog] = useState<WorkLog | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStartDate(new Date()));
    const [isTourOpen, setIsTourOpen] = useState(false);

    useEffect(() => {
        if (state.currentUser) {
            const tourCompleted = localStorage.getItem(`workie_tour_completed_${state.currentUser}`);
            if (!tourCompleted) {
                // Use a small timeout to ensure the dashboard has rendered before the tour appears
                setTimeout(() => setIsTourOpen(true), 500);
            }
        }
    }, [state.currentUser]);

    const handleTourComplete = () => {
        if (state.currentUser) {
            localStorage.setItem(`workie_tour_completed_${state.currentUser}`, 'true');
        }
        setIsTourOpen(false);
    };

    const openModal = (log: WorkLog | null = null) => {
        setEditingLog(log);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setEditingLog(null);
        setIsModalOpen(false);
    };
    
    const handleSave = () => {
        closeModal();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
    };
    
    const openDeleteModal = (log: WorkLog) => {
        setDeletingLog(log);
    }
    
    const closeDeleteModal = () => {
        setDeletingLog(null);
    }

    const weeklyLogs = useMemo(() => {
        const weekStartStr = formatDate(currentWeekStart);
        const weekEndStr = formatDate(addDays(currentWeekStart, 6));
        return state.logs.filter(log => log.date >= weekStartStr && log.date <= weekEndStr);
    }, [state.logs, currentWeekStart]);

    const changeWeek = (direction: 'prev' | 'next') => {
        const newWeekStart = addDays(currentWeekStart, direction === 'prev' ? -7 : 7);
        setCurrentWeekStart(newWeekStart);
    }
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            // Add 'T00:00:00' to parse the date in the user's local timezone
            const dateObj = new Date(selectedDate + 'T00:00:00');
            const newWeekStart = getWeekStartDate(dateObj);
            setCurrentWeekStart(newWeekStart);
        }
    };

    const handleExport = () => {
        if (state.currentUser) {
            exportToPdf(weeklyLogs, state.currentUser, state.settings.currency);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {isTourOpen && <OnboardingTour onComplete={handleTourComplete} />}
            <Header />

            <main className="mt-8 space-y-8">
                
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-700">Weekly Overview</h2>
                     <div className="flex items-center gap-2">
                        <button onClick={() => changeWeek('prev')} className="p-2 rounded-full hover:bg-purple-200 transition"><IconChevronLeft className="h-6 w-6 text-purple-500" /></button>
                         <input
                            type="date"
                            value={formatDate(currentWeekStart)}
                            onChange={handleDateChange}
                            className="bg-transparent text-gray-600 font-medium rounded-lg p-2 border-2 border-transparent hover:border-purple-200 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 w-40 text-center"
                            aria-label="Select week start date"
                        />
                        <button onClick={() => changeWeek('next')} className="p-2 rounded-full hover:bg-purple-200 transition"><IconChevronRight className="h-6 w-6 text-purple-500" /></button>
                    </div>
                </div>

                <BentoDashboard logs={weeklyLogs} weekStart={currentWeekStart} />
                
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-700">Work Logs</h2>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2 text-purple-600 bg-purple-100 rounded-xl hover:bg-purple-200 transition"
                            >
                                <IconDownload className="h-5 w-5" />
                                Export
                            </button>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-purple-500 rounded-xl hover:bg-purple-600 transition shadow-md hover:shadow-lg"
                            >
                                <IconPlus className="h-5 w-5" />
                                Add Log
                            </button>
                        </div>
                    </div>
                    
                    <WorkLogTable logs={weeklyLogs} onEdit={openModal} onDelete={openDeleteModal} />
                </div>
            </main>

            {isModalOpen && <LogModal log={editingLog} onClose={closeModal} onSave={handleSave} />}
            {deletingLog && <DeleteConfirmationModal log={deletingLog} onClose={closeDeleteModal} />}
            {showCelebration && <CelebrationPopup />}
        </div>
    );
};

export default Dashboard;
