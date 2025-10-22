
import React from 'react';

const CelebrationPopup: React.FC = () => {
    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-out">
            <style>{`
                @keyframes fade-in-out {
                    0% { opacity: 0; transform: translate(-50%, -20px); }
                    20% { opacity: 1; transform: translate(-50%, 0); }
                    80% { opacity: 1; transform: translate(-50%, 0); }
                    100% { opacity: 0; transform: translate(-50%, -20px); }
                }
                .animate-fade-in-out {
                    animation: fade-in-out 2s forwards;
                }
            `}</style>
            <span>✨ Success! Log saved. ✨</span>
        </div>
    );
};

export default CelebrationPopup;
