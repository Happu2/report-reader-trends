
import React from 'react';
import { Activity } from 'lucide-react';

interface ProcessingIndicatorProps {
  progress: number;
}

export const ProcessingIndicator = ({ progress }: ProcessingIndicatorProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <Activity className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Processing Your Lab Report
      </h3>
      
      <p className="text-gray-600 mb-6">
        Extracting health parameters and analyzing data...
      </p>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{Math.round(progress)}% Complete</p>
      </div>
    </div>
  );
};
