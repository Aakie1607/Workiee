import React, { useState, useMemo, useEffect } from 'react';
import { useWorkie } from '../store/WorkieContext';
import { WorkLog } from '../types';
import LogModal from './LogModal';
import BentoDashboard from './BentoDashboard';
import WorkLogTable from './WorkLogTable';
import Header from './Header';
import { addDays, formatDate, getWeekStartDate } from '../utils/dateUtils';
import { IconPlus, IconChevronLeft, IconChevronRight, IconDownload, IconCalendar } from './icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import CelebrationPopup from './CelebrationPopup';
import OnboardingTour from './OnboardingTour';
import { exportToPdf } from '../utils/csvUtils';
import { WEEKLY_HOUR_LIMIT } from '../constants'; 
import DatePicker from './ui/DatePicker';
import DailyCalendarModal from './DailyCalendarModal';

const Dashboard: React.FC = () => {
    const { state } = useWorkie();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
    const [deletingLog, setDeletingLog] = useState<WorkLog | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStartDate(new Date()));
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [showDailyCalendar, setShowDailyCalendar] = useState(false); // New state for daily calendar visibility
    const [selectedDailyDate, setSelectedDailyDate] = useState<string | null>(null); // New state for selected daily date

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

    // New memoized value for logs to display in the table, considering daily selection
    const displayedLogs = useMemo(() => {
        if (selectedDailyDate) {
            return state.logs.filter(log => log.date === selectedDailyDate);
        }
        return weeklyLogs;
    }, [state.logs, weeklyLogs, selectedDailyDate]);


    const changeWeek = (direction: 'prev' | 'next') => {
        const newWeekStart = addDays(currentWeekStart, direction === 'prev' ? -7 : 7);
        setCurrentWeekStart(newWeekStart);
        setSelectedDailyDate(null); // Clear daily selection when week changes
    }
    
    // Updated handleDateChange to work with DatePicker's (name, value) signature
    const handleDateChange = (name: string, value: string) => {
        if (value) {
            // Add 'T00:00:00' to parse the date in the user's local timezone
            const dateObj = new Date(value + 'T00:00:00');
            const newWeekStart = getWeekStartDate(dateObj);
            setCurrentWeekStart(newWeekStart);
        }
        setSelectedDailyDate(null); // Clear daily selection when week changes
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
                         <DatePicker // Replaced native input with custom DatePicker
                            name="weekStartDate"
                            value={formatDate(currentWeekStart)}
                            onChange={handleDateChange}
                            className="w-40" 
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
                            {/* New Calendar Button */}
                            <button
                                onClick={() => setShowDailyCalendar(true)}
                                className="flex items-center gap-2 px-4 py-2 text-purple-600 bg-purple-100 rounded-xl hover:bg-purple-200 transition"
                            >
                                <IconCalendar className="h-5 w-5" />
                                Calendar
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
                    
                    <WorkLogTable logs={displayedLogs} onEdit={openModal} onDelete={openDeleteModal} />
                </div>
            </main>

            {isModalOpen && <LogModal 
                log={editingLog} 
                onClose={closeModal} 
                onSave={handleSave} 
                allLogs={state.logs} 
                payRates={state.settings.payRates} 
                weeklyHourLimit={WEEKLY_HOUR_LIMIT} 
                currency={state.settings.currency} 
            />}
            {deletingLog && <DeleteConfirmationModal log={deletingLog} onClose={closeDeleteModal} />}
            {showCelebration && <CelebrationPopup />}

            {/* Daily Calendar Modal */}
            {showDailyCalendar && (
                <DailyCalendarModal
                    onClose={() => setShowDailyCalendar(false)}
                    onDateSelect={(date) => {
                        setSelectedDailyDate(date);
                        setShowDailyCalendar(false);
                    }}
                    selectedDate={selectedDailyDate}
                />
            )}
        </div>
    );
};

export default Dashboard;