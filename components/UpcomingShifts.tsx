import React, { useMemo } from 'react';
import { WorkLog } from '../types'; // Changed from Shift to WorkLog
import { formatDayOfWeekShort, formatMonthYear } from '../utils/dateUtils';

interface UpcomingShiftsProps {
    shifts: WorkLog[]; // Changed from Shift[] to WorkLog[]
}

const UpcomingShifts: React.FC<UpcomingShiftsProps> = ({ shifts }) => {
    const groupedShifts = useMemo(() => {
        const groups: { [monthYear: string]: WorkLog[] } = {}; // Changed to WorkLog[]
        shifts.forEach(shift => {
            const shiftDate = new Date(shift.date + 'T00:00:00'); // Ensure local timezone parsing
            const monthYear = formatMonthYear(shiftDate);
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(shift);
        });

        // Sort shifts within each month by date and then time
        for (const monthYear in groups) {
            groups[monthYear].sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.startTime).getTime();
                const dateB = new Date(b.date + 'T' + b.startTime).getTime();
                return dateA - dateB;
            });
        }
        return groups;
    }, [shifts]);

    const sortedMonths = useMemo(() => {
        return Object.keys(groupedShifts).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA.getTime() - dateB.getTime();
        });
    }, [groupedShifts]);

    if (shifts.length === 0) {
        return (
            <div className="text-center py-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md text-gray-700" role="status">
                <p>No upcoming shifts scheduled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6" role="list">
            {sortedMonths.map(monthYear => (
                <div key={monthYear}>
                    <h3 className="text-xl font-bold text-gray-700 mb-4" id={`shifts-for-${monthYear.replace(/\s/g, '-')}`}>{monthYear}</h3>
                    <div className="flex flex-wrap gap-3" role="group" aria-labelledby={`shifts-for-${monthYear.replace(/\s/g, '-')}`}> {/* Changed to flex wrap with gap */}
                        {groupedShifts[monthYear].map(shift => {
                            const shiftDate = new Date(shift.date + 'T00:00:00'); // Ensure local timezone parsing
                            const dayOfMonth = shiftDate.getDate();
                            const dayOfWeek = formatDayOfWeekShort(shiftDate);
                            const shiftTitle = shift.workType === 'Custom' && shift.customWorkType ? shift.customWorkType : shift.workType;

                            return (
                                <div key={shift.id} className="flex flex-shrink-0 flex-grow-0 basis-64 items-center gap-3 p-2 rounded-lg shadow-sm bg-purple-50 hover:bg-purple-100 transition-colors" role="listitem" aria-label={`Shift on ${dayOfWeek}, ${dayOfMonth} ${monthYear}`}> {/* Added basis, flex-shrink/grow, and shadow-sm */}
                                    {/* Date & Day */}
                                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 text-center bg-purple-100/50 rounded-md"> {/* Smaller square, bg, rounded */}
                                        <span className="font-bold text-gray-800 text-xl leading-none">{dayOfMonth}</span> {/* Smaller font, no extra line height */}
                                        <span className="text-gray-500 text-xs uppercase">{dayOfWeek}</span> {/* Smaller font, uppercase */}
                                    </div>
                                    {/* Shift Details */}
                                    <div className="flex-grow border-l-2 border-purple-300 pl-3"> {/* Thinner border, reduced padding */}
                                        <p className="font-medium text-gray-800 text-sm"> {/* Smaller font */}
                                            {shift.startTime} - {shift.endTime}
                                        </p>
                                        <p className="text-purple-700 text-sm font-semibold">{shiftTitle}</p> {/* Emphasized title */}
                                        <p className="text-gray-500 text-xs italic truncate">{shift.notes || 'No additional details provided'}</p> {/* Smaller, italic notes */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UpcomingShifts;