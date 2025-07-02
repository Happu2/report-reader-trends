
import React from 'react';
import { Activity } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Korai Health</h1>
              <p className="text-sm text-gray-600">Lab Report Analyzer</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Demo Version
          </div>
        </div>
      </div>
    </header>
  );
};
