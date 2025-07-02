
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useLabReport } from '@/contexts/LabReportContext';
import { processFile } from '@/utils/fileProcessor';
import { ParametersTable } from './ParametersTable';
import { TrendsChart } from './TrendsChart';
import { ProcessingIndicator } from './ProcessingIndicator';

export const FileUpload = () => {
  const { parameters, setParameters, isProcessing, setIsProcessing, uploadProgress, setUploadProgress } = useLabReport();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const extractedData = await processFile(file, setUploadProgress);
      setParameters(extractedData);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [setParameters, setIsProcessing, setUploadProgress]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (isProcessing) {
    return <ProcessingIndicator progress={uploadProgress} />;
  }

  if (parameters.length > 0) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Lab Results Analysis</h2>
            <button
              onClick={() => setParameters([])}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Upload New Report
            </button>
          </div>
          <ParametersTable parameters={parameters} />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Trends</h2>
          <TrendsChart parameters={parameters} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex justify-center mb-6">
          <div className={`
            p-4 rounded-full transition-colors
            ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            <Upload className={`h-12 w-12 ${isDragActive ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragActive ? 'Drop your file here' : 'Upload Lab Report'}
        </h3>
        
        <p className="text-gray-600 mb-6">
          Drag and drop your lab report, or click to browse
        </p>

        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ImageIcon className="h-4 w-4" />
            <span>Images</span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Maximum file size: 10MB
        </p>
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Upload Error</p>
          </div>
          <ul className="mt-2 text-sm text-red-700">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
