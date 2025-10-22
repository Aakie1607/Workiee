import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IconClose, IconChevronLeft, IconChevronRight } from './icons';
import { formatDate } from '../utils/dateUtils';

interface DailyCalendarModalProps {
    onClose: () => void;
    onDateSelect: (date: string) => void;
    selectedDate: string | null; // YYYY-MM-DD
}

// Helper functions for calendar logic
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getCalendarStartDay = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6 (end of week), Monday (1) to 0 (start)
};

const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({ onClose, onDateSelect, selectedDate }) => {
    const calendarRef = useRef<HTMLDivElement>(null);

    const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => {
            if (prev === 0) {
                setCurrentYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => {
            if (prev === 11) {
                setCurrentYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    }, []);

    const handleDayClick = useCallback((day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onDateSelect(formatDate(newDate));
    }, [currentYear, currentMonth, onDateSelect]);

    const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
    const startDay = useMemo(() => getCalendarStartDay(currentYear, currentMonth), [currentYear, currentMonth]);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    const days = [];
    // Add empty placeholders for days before the start of the month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="p-2.5 text-center text-gray-400"></div>);
    }
    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dateString = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const isSelected = selectedDate === dateString;
        const isToday = isCurrentMonth && today.getDate() === i;

        days.push(
            <button
                key={dateString}
                onClick={() => handleDayClick(i)}
                className={`p-2.5 rounded-lg text-center font-medium transition-colors duration-150
                    ${isSelected ? 'bg-purple-200 text-purple-800 font-semibold' : 'text-gray-800 hover:bg-purple-100'}
                    ${isToday && !isSelected ? 'border-2 border-purple-400' : ''}
                `}
                aria-current={isToday ? 'date' : undefined}
                aria-selected={isSelected}
            >
                {i}
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={calendarRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">Select Date</h2>

                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Previous month">
                        <IconChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-800">
                        {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Next month">
                        <IconChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
                <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 gap-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="py-1">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-2">
                    {days}
                </div>
            </div>
        </div>
    );
};

export default DailyCalendarModal;