

import React, { useState } from 'react';
import { IconChevronLeft, IconChevronRight, IconClose } from './icons';

interface OnboardingTourProps {
    onComplete: () => void;
}

const TOUR_STEPS = [
    {
        title: "Welcome to Workie! 👋",
        content: "Let's take a quick tour of the key features to get you started."
    },
    {
        title: "Step 1: Add a Work Log",
        content: "This is your command center. Start by clicking the 'Add Log' button to record your work hours and calculate your pay for each shift."
    },
    {
        title: "Step 2: View Your Weekly Overview",
        content: "Here, you can see a summary of your weekly earnings, total hours, and a visual chart of your daily activity. Use the arrows to navigate between weeks."
    },
    {
        title: "Step 3: Access Profile & Settings",
        content: "Click on your avatar to open the menu. From there, you can view your profile for monthly stats, manage your settings, or sign out."
    },
    {
        title: "You're all set! 🎉",
        content: "You're ready to go. Start tracking your work and take control of your earnings. Enjoy using Workie!"
    }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] p-4 animate-fade-in-fast">
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
            `}</style>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative text-center">
                 <button onClick={onComplete} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <IconClose className="h-6 w-6" />
                </button>
                <img src="https://res.cloudinary.com/dt2cxv6zw/image/upload/e_background_removal/a_-90/a_90/c_pad,w_650,h_488,f_png/v1761127504/ChatGPT_Image_Oct_22_2025_03_31_08_PM_mk5k8v.png" alt="Workie Mascot" className="w-24 h-auto mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-purple-600 mb-2">{step.title}</h2>
                <p className="text-gray-600 mb-6">{step.content}</p>

                <div className="flex justify-between items-center">
                    <button 
                        onClick={onComplete} 
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        Skip Tour
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-200 transition" aria-label="Previous step">
                                <IconChevronLeft className="h-6 w-6 text-gray-600" />
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            {currentStep < TOUR_STEPS.length - 1 && <IconChevronRight className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mt-4">
                    {TOUR_STEPS.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full mx-1 transition-colors ${index === currentStep ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
