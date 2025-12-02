import React from 'react';
import { UserRequirements } from '../types';
import { COUNTRIES } from '../constants';
import { Building, Home, Ruler, MapPin, CheckCircle2 } from 'lucide-react';

interface PlanFormProps {
  requirements: UserRequirements;
  onChange: (req: UserRequirements) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ requirements, onChange, onSubmit, isSubmitting }) => {
  const handleChange = (field: keyof UserRequirements, value: any) => {
    onChange({ ...requirements, [field]: value });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building className="w-6 h-6 text-blue-400" />
          Project Requirements
        </h2>
        <p className="text-slate-400 text-sm mt-1">Define your space to generate an optimized floor plan.</p>
      </div>

      <div className="p-8 space-y-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Total Area (sq ft)
            </label>
            <input
              type="number"
              value={requirements.totalArea}
              onChange={(e) => handleChange('totalArea', parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="e.g. 1200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Country (Bylaws)
            </label>
            <select
              value={requirements.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Config */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" /> Room Configuration
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition cursor-pointer bg-slate-50">
                <span className="text-slate-600 font-medium">Bedrooms</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleChange('rooms', Math.max(1, requirements.rooms - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-slate-600 hover:text-blue-600 font-bold"
                  >-</button>
                  <span className="w-4 text-center font-semibold">{requirements.rooms}</span>
                   <button
                    onClick={() => handleChange('rooms', Math.min(10, requirements.rooms + 1))}
                    className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-slate-600 hover:text-blue-600 font-bold"
                  >+</button>
                </div>
             </div>

             {/* Toggles */}
             <div
                onClick={() => handleChange('hasHall', !requirements.hasHall)}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${requirements.hasHall ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
             >
                <span className={`${requirements.hasHall ? 'text-blue-700' : 'text-slate-600'} font-medium`}>Living Hall</span>
                {requirements.hasHall && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
             </div>

             <div
                onClick={() => handleChange('hasKitchen', !requirements.hasKitchen)}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${requirements.hasKitchen ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
             >
                <span className={`${requirements.hasKitchen ? 'text-blue-700' : 'text-slate-600'} font-medium`}>Kitchen</span>
                {requirements.hasKitchen && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
             </div>

             <div
                onClick={() => handleChange('hasBalcony', !requirements.hasBalcony)}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${requirements.hasBalcony ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
             >
                <span className={`${requirements.hasBalcony ? 'text-blue-700' : 'text-slate-600'} font-medium`}>Balcony</span>
                {requirements.hasBalcony && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
             </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Additional Preferences</label>
            <textarea
              rows={3}
              value={requirements.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              placeholder="e.g., I need a large master bedroom with an attached bath, south-facing entrance..."
            />
        </div>

        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {isSubmitting ? 'Processing...' : 'Generate Intelligent Plan'}
        </button>
      </div>
    </div>
  );
};

export default PlanForm;
