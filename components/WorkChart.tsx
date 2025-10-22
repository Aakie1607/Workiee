
import React, { useEffect, useRef, useMemo } from 'react';
import { WorkLog } from '../types';
import { getWeekDates, formatDate } from '../utils/dateUtils';

interface WorkChartProps {
    logs: WorkLog[];
    weekStart: Date;
}

const WorkChart: React.FC<WorkChartProps> = ({ logs, weekStart }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null); // Using any because Chart.js is from CDN

    const chartData = useMemo(() => {
        const weekDates = getWeekDates(weekStart);
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = Array(7).fill(0);

        logs.forEach(log => {
            const logDate = new Date(log.date + 'T00:00:00');
            const dayIndex = weekDates.findIndex(d => formatDate(d) === formatDate(logDate));
            if (dayIndex !== -1) {
                data[dayIndex] += log.hoursWorked;
            }
        });
        
        return { labels, data };
    }, [logs, weekStart]);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (!ctx) return;
            
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            chartInstanceRef.current = new (window as any).Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'Hours Worked',
                        data: chartData.data,
                        backgroundColor: 'rgba(192, 132, 252, 0.6)',
                        borderColor: 'rgba(192, 132, 252, 1)',
                        borderWidth: 1,
                        borderRadius: 8,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                            }
                        },
                        x: {
                             grid: {
                                display: false,
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true, // Enable tooltips
                            callbacks: {
                                label: function(context: any) {
                                    // Display the label with the formatted value (hours worked)
                                    return `${context.dataset.label}: ${parseFloat(context.formattedValue).toFixed(2)} hours`;
                                }
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chartData]);


    return (
        <div className="bg-transparent h-full">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default WorkChart;
