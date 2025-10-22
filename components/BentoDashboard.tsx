import React, { useMemo } from 'react';
import { WorkLog } from '../types';
import { WEEKLY_HOUR_LIMIT } from '../constants';
import { AnimatedGradient } from './ui/animated-gradient-with-svg';
import WorkChart from './WorkChart';
import { useWorkie } from '../store/WorkieContext';

interface BentoCardProps {
  title?: string;
  value?: string | number;
  subtitle?: string;
  colors: string[];
  children?: React.ReactNode;
  className?: string;
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  colors,
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden h-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-md ${className}`}
    >
      <AnimatedGradient colors={colors} speed={5} blur="medium" />
      <div
        className="relative z-10 p-4 sm:p-5 md:p-6 h-full flex flex-col"
      >
        {title && <h3 className="text-base font-medium md:text-lg text-gray-700">{title}</h3>}
        {value && <p className="text-3xl sm:text-4xl md:text-5xl font-bold my-1 text-gray-900">{value}</p>}
        {subtitle && <p className="text-sm text-gray-600/90">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};


interface BentoDashboardProps {
    logs: WorkLog[];
    weekStart: Date;
}

const SummaryStat: React.FC<{ title: string; value: string | number; subtitle: string; valueClassName?: string }> = ({ title, value, subtitle, valueClassName = 'text-gray-900' }) => (
    <div className="text-center flex-1 p-2">
        <h3 className="text-sm sm:text-base font-medium text-gray-700">{title}</h3>
        <p className={`text-3xl sm:text-4xl font-bold my-1 ${valueClassName}`}>{value}</p>
        <p className="text-xs sm:text-sm text-gray-600/90">{subtitle}</p>
    </div>
);


const BentoDashboard: React.FC<BentoDashboardProps> = ({ logs, weekStart }) => {
    const { state } = useWorkie();
    
    const summary = useMemo(() => {
        const totalHours = logs.reduce((sum, log) => sum + log.hoursWorked, 0);
        const totalEarnings = logs.reduce((sum, log) => sum + log.pay, 0);
        const hoursRemaining = WEEKLY_HOUR_LIMIT - totalHours;
        return { totalHours, totalEarnings, hoursRemaining };
    }, [logs]);
    
    const lightPink = '#fce7f3';
    const lightPurple = '#ede9fe';
    const lightMint = '#d1fae5';

    return (
        <div className="w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-3">
                     <BentoCard colors={[lightPink, lightPurple, lightMint]}>
                        <div className="flex flex-col sm:flex-row justify-around items-stretch h-full w-full py-2 sm:py-0">
                            <SummaryStat
                                title="Total Earnings"
                                value={`${state.settings.currency}${summary.totalEarnings.toFixed(2)}`}
                                subtitle="This week"
                            />
                            <div className="w-full sm:w-px h-px sm:h-auto bg-gray-900/10 my-2 sm:my-4 mx-0 sm:mx-4"></div>
                            <SummaryStat
                                title="Weekly Hours"
                                value={summary.totalHours.toFixed(2)}
                                subtitle="Logged"
                            />
                            <div className="w-full sm:w-px h-px sm:h-auto bg-gray-900/10 my-2 sm:my-4 mx-0 sm:mx-4"></div>
                            <SummaryStat
                                title="Hours Remaining"
                                value={summary.hoursRemaining.toFixed(2)}
                                subtitle={summary.hoursRemaining < 0 ? "Limit exceeded!" : "Until limit"}
                                valueClassName={summary.hoursRemaining < 0 ? "text-red-600" : "text-gray-900"}
                            />
                        </div>
                    </BentoCard>
                </div>
                 <div className="md:col-span-3 h-[22rem]">
                   <BentoCard
                       title="Daily Hours Breakdown"
                       colors={[lightMint, lightPurple, lightPink]}
                   >
                     <div className="flex-grow pt-4 h-full">
                        <WorkChart logs={logs} weekStart={weekStart} />
                     </div>
                   </BentoCard>
                </div>
            </div>
        </div>
    );
};

export default BentoDashboard;
