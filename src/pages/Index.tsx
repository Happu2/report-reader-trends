
import React from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { LabReportProvider } from '@/contexts/LabReportContext';

const Index = () => {
  return (
    <LabReportProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Health Report Analyzer
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload your lab reports and get instant insights into your health parameters with trend analysis and AI-powered recommendations.
              </p>
            </div>
            <FileUpload />
          </div>
        </main>
      </div>
    </LabReportProvider>
  );
};

export default Index;
