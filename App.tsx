import React, { useState } from 'react';
import { AppState, UserRequirements, GeneratedPlan, PlanAnalysis } from './types';
import { DEFAULT_REQUIREMENTS } from './constants';
import { generatePlanAnalysis, generatePlanImage, validatePlanWithVision } from './services/gemini';
import PlanForm from './components/PlanForm';
import LoadingState from './components/LoadingState';
import ResultView from './components/ResultView';
import { Layout } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [requirements, setRequirements] = useState<UserRequirements>(DEFAULT_REQUIREMENTS);
  const [result, setResult] = useState<GeneratedPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setAppState(AppState.GENERATING_ANALYSIS);
      setErrorMsg(null);

      // Step 1: Logic & Analysis (Calculations)
      const analysis: PlanAnalysis = await generatePlanAnalysis(requirements);
      
      // Step 2: Image Generation
      setAppState(AppState.GENERATING_IMAGE);
      const imageUrl = await generatePlanImage(analysis.visualPrompt);

      // Step 3: Vision Compliance Audit (New Step)
      setAppState(AppState.ANALYZING_COMPLIANCE);
      const complianceReport = await validatePlanWithVision(imageUrl, requirements);

      // Merge results
      const finalAnalysis = {
        ...analysis,
        bylawCompliance: complianceReport
      };

      setResult({
        imageUrl,
        analysis: finalAnalysis,
        timestamp: Date.now()
      });

      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while generating the plan.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setResult(null);
    setErrorMsg(null);
  };

  const getLoadingStage = () => {
    if (appState === AppState.GENERATING_ANALYSIS) return 'ANALYZING';
    if (appState === AppState.GENERATING_IMAGE) return 'RENDERING';
    return 'AUDITING';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Layout className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Archi<span className="text-blue-600">Gen</span>
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            AI-Powered Floor Plan Generator
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8">
        {appState === AppState.INPUT && (
          <div className="w-full animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Design Your Dream Layout in Seconds
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Input your requirements, select your country for bylaw compliance, and let our AI architect generate an optimized floor plan for you.
              </p>
            </div>
            <PlanForm 
              requirements={requirements}
              onChange={setRequirements}
              onSubmit={handleGenerate}
              isSubmitting={false}
            />
          </div>
        )}

        {(appState === AppState.GENERATING_ANALYSIS || appState === AppState.GENERATING_IMAGE || appState === AppState.ANALYZING_COMPLIANCE) && (
          <LoadingState stage={getLoadingStage()} />
        )}

        {appState === AppState.RESULT && result && (
          <ResultView plan={result} onReset={handleReset} />
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Generation Failed</h3>
            <p className="text-slate-600 mb-6">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} ArchiGen AI. Powered by Google Gemini 2.5.
        </div>
      </footer>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;