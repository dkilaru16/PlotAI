import React, { useEffect, useState } from 'react';
import { MOCK_LOADING_STEPS } from '../constants';
import { Loader2, ScanEye } from 'lucide-react';

interface LoadingStateProps {
  stage: 'ANALYZING' | 'RENDERING' | 'AUDITING';
}

const LoadingState: React.FC<LoadingStateProps> = ({ stage }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % MOCK_LOADING_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch (stage) {
      case 'ANALYZING': return 'Architectural Analysis AI';
      case 'RENDERING': return 'Rendering Blueprint';
      case 'AUDITING': return 'Verifying Regulatory Compliance';
    }
  };

  const getIcon = () => {
    if (stage === 'AUDITING') return <ScanEye className="w-10 h-10 text-purple-600 animate-pulse" />;
    return <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />;
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="relative mb-8">
        <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${stage === 'AUDITING' ? 'bg-purple-100' : 'bg-blue-100'}`}></div>
        <div className={`relative bg-white p-4 rounded-full border-4 ${stage === 'AUDITING' ? 'border-purple-50' : 'border-blue-50'}`}>
          {getIcon()}
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {getTitle()}
      </h3>
      
      {stage !== 'AUDITING' ? (
        <div className="h-6 overflow-hidden relative w-full">
           <p className="text-slate-500 text-sm transition-all duration-500 ease-in-out absolute w-full left-0" key={stepIndex}>
             {MOCK_LOADING_STEPS[stepIndex]}
           </p>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Scanning generated map for bylaw adherence...</p>
      )}

      <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
        <div className={`h-full rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/3 ${stage === 'AUDITING' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;