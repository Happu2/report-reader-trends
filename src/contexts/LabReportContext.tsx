
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface HealthParameter {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  category: string;
}

export interface HistoricalData {
  date: string;
  value: number;
}

export interface HealthParameterWithHistory extends HealthParameter {
  history: HistoricalData[];
}

interface LabReportContextType {
  parameters: HealthParameterWithHistory[];
  setParameters: (parameters: HealthParameterWithHistory[]) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
}

const LabReportContext = createContext<LabReportContextType | undefined>(undefined);

export const useLabReport = () => {
  const context = useContext(LabReportContext);
  if (!context) {
    throw new Error('useLabReport must be used within a LabReportProvider');
  }
  return context;
};

export const LabReportProvider = ({ children }: { children: ReactNode }) => {
  const [parameters, setParameters] = useState<HealthParameterWithHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  return (
    <LabReportContext.Provider value={{
      parameters,
      setParameters,
      isProcessing,
      setIsProcessing,
      uploadProgress,
      setUploadProgress,
    }}>
      {children}
    </LabReportContext.Provider>
  );
};
