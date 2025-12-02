import React from 'react';
import { GeneratedPlan, RoomDimension, BylawCheck } from '../types';
import { Download, Share2, Check, AlertTriangle, XCircle, FileText, BarChart3, Maximize2, Ruler } from 'lucide-react';

interface ResultViewProps {
  plan: GeneratedPlan;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ plan, onReset }) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = plan.imageUrl;
    link.download = `archigen-plan-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Image & Main Actions */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-500" />
                Generated Blueprint
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={downloadImage}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded flex items-center gap-1 transition"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
            
            <div className="relative bg-slate-100 min-h-[300px] md:min-h-[450px] flex items-center justify-center p-4">
              {plan.imageUrl ? (
                 <img 
                 src={plan.imageUrl} 
                 alt="Generated Floor Plan" 
                 className="w-full h-auto max-h-[650px] object-contain shadow-sm bg-white rounded-sm border border-slate-200"
               />
              ) : (
                <div className="text-slate-400">Image generation failed or not available.</div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 text-xs text-slate-500 border-t border-slate-100 flex justify-between">
              <span>* AI-generated concept with estimated dimensions.</span>
              <span className="font-semibold text-blue-600">Scale: Not to scale</span>
            </div>
          </div>

          {/* Distribution Logic */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Architect's Logic
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {plan.analysis.distributionLogic}
            </p>
          </div>
        </div>

        {/* Right Column: Data & Specs */}
        <div className="lg:w-96 space-y-6">
          
          {/* Efficiency Score */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Space Efficiency Score</div>
            <div className="text-4xl font-bold flex items-end gap-2">
              {plan.analysis.efficiencyScore}
              <span className="text-lg opacity-80 mb-1">/ 100</span>
            </div>
            <div className="mt-4 h-2 bg-blue-900/30 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-white rounded-full" 
                 style={{ width: `${plan.analysis.efficiencyScore}%` }}
               ></div>
            </div>
          </div>

          {/* Room Dimensions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 <Ruler className="w-4 h-4 text-blue-600" /> Room Measurements
              </h4>
            </div>
            <div className="divide-y divide-slate-100">
              {(plan.analysis.roomDimensions || []).map((room, idx) => (
                <div key={idx} className="p-3 text-sm hover:bg-slate-50 transition">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{room.name}</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold font-mono">
                      {room.width} x {room.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs">
                    <span className="italic">{room.notes}</span>
                    <span>{room.area} sq ft</span>
                  </div>
                </div>
              ))}
              <div className="p-3 bg-slate-50 flex justify-between text-sm font-bold text-slate-700 border-t border-slate-200">
                <span>Total Utilized</span>
                <span>{plan.analysis.totalUtilizedArea} sq ft</span>
              </div>
            </div>
          </div>

          {/* Bylaws Compliance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                 <Check className="w-4 h-4 text-green-600" /> Regulatory Compliance
              </h4>
            </div>
            <div className="divide-y divide-slate-100">
              {(plan.analysis.bylawCompliance || []).map((bylaw, idx) => (
                <div key={idx} className="p-3 flex gap-3 items-start">
                  <div className="mt-0.5">
                    {bylaw.status === 'Compliant' && <Check className="w-4 h-4 text-green-500" />}
                    {bylaw.status === 'Warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {bylaw.status === 'Non-Compliant' && <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{bylaw.rule}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{bylaw.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
          >
            Create New Plan
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResultView;