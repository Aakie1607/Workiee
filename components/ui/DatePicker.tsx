
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from '../icons'; 
import { formatDate } from '../../utils/dateUtils'; 

interface DatePickerProps {
    label?: string; 
    name: string;
    value: string; // YYYY-MM-DD
    onChange: (name: string, value: string) => void;
    error?: string;
    className?: string;
}

// Helper functions for calendar logic
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getCalendarStartDay = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6 (end of week), Monday (1) to 0 (start)
};

const DatePicker: React.FC<DatePickerProps> = ({
    label,
    name,
    value,
    onChange,
    error,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const selectedDate = value ? new Date(value + 'T00:00:00') : null;
    const [currentMonth, setCurrentMonth] = useState(selectedDate?.getMonth() || new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate?.getFullYear() || new Date().getFullYear());

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(selectedDate.getMonth());
            setCurrentYear(selectedDate.getFullYear());
        }
    }, [selectedDate]);

    const handleInputClick = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const handleDateSelect = useCallback((day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onChange(name, formatDate(newDate));
        setIsOpen(false);
    }, [name, currentYear, currentMonth, onChange]);

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
        const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
        const isToday = isCurrentMonth && today.getDate() === i;

        days.push(
            <button
                key={dateKey}
                onClick={() => handleDateSelect(i)}
                className={`p-2.5 rounded-lg text-center font-medium transition-colors duration-150
                    ${isSelected ? 'bg-purple-500 text-white shadow-md' : 'text-gray-800 hover:bg-purple-100'}
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
        <div className={`relative ${className}`} ref={datePickerRef}>
            {label && <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
            <input
                type="text" 
                readOnly
                value={value || ''}
                onClick={handleInputClick}
                placeholder="Select a date"
                className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 cursor-pointer ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            {isOpen && (
                <div className="absolute z-10 w-72 left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg animate-slide-down-fade p-4">
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
            )}
            <style jsx>{`
                .animate-slide-down-fade {
                    animation: slideDownFade 0.2s ease-out forwards;
                }
                @keyframes slideDownFade {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DatePicker;
    