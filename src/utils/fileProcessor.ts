
import Tesseract from 'tesseract.js';
import { HealthParameterWithHistory, HistoricalData } from '@/contexts/LabReportContext';

export const processFile = async (
  file: File, 
  onProgress: (progress: number) => void
): Promise<HealthParameterWithHistory[]> => {
  let text = '';

  if (file.type === 'application/pdf') {
    // For PDF processing, we'll simulate extraction since pdf-parse doesn't work in browser
    // In a real app, this would be handled by a backend service
    onProgress(50);
    text = await simulatePDFExtraction();
    onProgress(100);
  } else {
    // Process image with Tesseract
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress(50 + (m.progress * 50));
        }
      }
    });
    text = result.data.text;
  }

  return parseHealthData(text);
};

const simulatePDFExtraction = async (): Promise<string> => {
  // Simulate PDF text extraction with sample lab report data
  return `
    COMPREHENSIVE METABOLIC PANEL
    Patient: John Doe
    Date: 2024-07-02
    
    GLUCOSE: 95 mg/dL (Reference Range: 70-99 mg/dL)
    CHOLESTEROL, TOTAL: 185 mg/dL (Reference Range: <200 mg/dL)
    HDL CHOLESTEROL: 55 mg/dL (Reference Range: >40 mg/dL)
    LDL CHOLESTEROL: 110 mg/dL (Reference Range: <100 mg/dL)
    TRIGLYCERIDES: 120 mg/dL (Reference Range: <150 mg/dL)
    HEMOGLOBIN A1C: 5.4% (Reference Range: <5.7%)
    CREATININE: 1.0 mg/dL (Reference Range: 0.7-1.3 mg/dL)
    BUN: 15 mg/dL (Reference Range: 7-20 mg/dL)
    SODIUM: 140 mEq/L (Reference Range: 136-145 mEq/L)
    POTASSIUM: 4.2 mEq/L (Reference Range: 3.5-5.0 mEq/L)
    VITAMIN D: 32 ng/mL (Reference Range: 30-100 ng/mL)
    TSH: 2.1 mIU/L (Reference Range: 0.4-4.0 mIU/L)
  `;
};

const parseHealthData = (text: string): HealthParameterWithHistory[] => {
  const parameters: HealthParameterWithHistory[] = [];
  
  // Common lab parameter patterns
  const patterns = [
    /(\w+(?:\s+\w+)*)\s*:?\s*(\d+\.?\d*)\s*(\w+\/?\w*)\s*(?:\(.*?(\d+\.?\d*)\s*-\s*(\d+\.?\d*)\s*.*?\))?/gi,
    /(GLUCOSE|CHOLESTEROL|HDL|LDL|TRIGLYCERIDES|HEMOGLOBIN|CREATININE|BUN|SODIUM|POTASSIUM|VITAMIN|TSH)\s*[,:]\s*(\d+\.?\d*)\s*(\w+\/?\w*)/gi
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const parameter = match[1].trim().toUpperCase();
      const value = parseFloat(match[2]);
      const unit = match[3] || '';
      const minRange = match[4] ? parseFloat(match[4]) : null;
      const maxRange = match[5] ? parseFloat(match[5]) : null;

      // Skip if we already have this parameter
      if (parameters.find(p => p.parameter === parameter)) continue;

      const referenceRange = minRange && maxRange 
        ? `${minRange}-${maxRange} ${unit}`
        : getReferenceRange(parameter, unit);

      const status = determineStatus(parameter, value, minRange, maxRange);
      const category = getCategory(parameter);
      const history = generateHistoricalData(parameter, value);

      parameters.push({
        id: `param_${parameters.length}`,
        parameter,
        value: value.toString(),
        unit,
        referenceRange,
        status,
        category,
        history
      });
    }
  });

  return parameters.length > 0 ? parameters : generateSampleData();
};

const getReferenceRange = (parameter: string, unit: string): string => {
  const ranges: Record<string, string> = {
    'GLUCOSE': '70-99 mg/dL',
    'CHOLESTEROL': '<200 mg/dL',
    'HDL CHOLESTEROL': '>40 mg/dL',
    'LDL CHOLESTEROL': '<100 mg/dL',
    'TRIGLYCERIDES': '<150 mg/dL',
    'HEMOGLOBIN A1C': '<5.7%',
    'CREATININE': '0.7-1.3 mg/dL',
    'BUN': '7-20 mg/dL',
    'SODIUM': '136-145 mEq/L',
    'POTASSIUM': '3.5-5.0 mEq/L',
    'VITAMIN D': '30-100 ng/mL',
    'TSH': '0.4-4.0 mIU/L'
  };
  
  return ranges[parameter] || 'Normal';
};

const determineStatus = (parameter: string, value: number, minRange?: number | null, maxRange?: number | null): 'normal' | 'high' | 'low' | 'critical' => {
  if (!minRange || !maxRange) {
    // Use parameter-specific logic
    const criticalHigh: Record<string, number> = {
      'GLUCOSE': 400,
      'CHOLESTEROL': 300,
      'LDL CHOLESTEROL': 190,
      'TRIGLYCERIDES': 500,
      'CREATININE': 3.0,
      'BUN': 50
    };

    if (criticalHigh[parameter] && value > criticalHigh[parameter]) {
      return 'critical';
    }

    // Default ranges for common parameters
    const defaultRanges: Record<string, [number, number]> = {
      'GLUCOSE': [70, 99],
      'CHOLESTEROL': [0, 200],
      'HDL CHOLESTEROL': [40, 100],
      'LDL CHOLESTEROL': [0, 100],
      'TRIGLYCERIDES': [0, 150],
      'CREATININE': [0.7, 1.3],
      'BUN': [7, 20],
      'SODIUM': [136, 145],
      'POTASSIUM': [3.5, 5.0],
      'VITAMIN D': [30, 100],
      'TSH': [0.4, 4.0]
    };

    const range = defaultRanges[parameter];
    if (range) {
      if (value < range[0]) return 'low';
      if (value > range[1]) return 'high';
    }
    return 'normal';
  }

  if (value < minRange) return 'low';
  if (value > maxRange) return 'high';
  return 'normal';
};

const getCategory = (parameter: string): string => {
  const categories: Record<string, string> = {
    'GLUCOSE': 'Diabetes',
    'HEMOGLOBIN A1C': 'Diabetes',
    'CHOLESTEROL': 'Lipid Panel',
    'HDL CHOLESTEROL': 'Lipid Panel',
    'LDL CHOLESTEROL': 'Lipid Panel',
    'TRIGLYCERIDES': 'Lipid Panel',
    'CREATININE': 'Kidney Function',
    'BUN': 'Kidney Function',
    'SODIUM': 'Electrolytes',
    'POTASSIUM': 'Electrolytes',
    'VITAMIN D': 'Vitamins',
    'TSH': 'Thyroid Function'
  };
  
  return categories[parameter] || 'General';
};

const generateHistoricalData = (parameter: string, currentValue: number): HistoricalData[] => {
  const history: HistoricalData[] = [];
  const months = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01'];
  
  // Generate realistic historical data with some variation
  for (let i = 0; i < months.length; i++) {
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const baseValue = currentValue * (1 + variation);
    history.push({
      date: months[i],
      value: Math.round(baseValue * 100) / 100
    });
  }
  
  // Add current value
  history.push({
    date: '2024-07-01',
    value: currentValue
  });
  
  return history;
};

const generateSampleData = (): HealthParameterWithHistory[] => {
  return [
    {
      id: 'glucose',
      parameter: 'GLUCOSE',
      value: '95',
      unit: 'mg/dL',
      referenceRange: '70-99 mg/dL',
      status: 'normal',
      category: 'Diabetes',
      history: [
        { date: '2024-01-01', value: 92 },
        { date: '2024-02-01', value: 89 },
        { date: '2024-03-01', value: 94 },
        { date: '2024-04-01', value: 91 },
        { date: '2024-05-01', value: 93 },
        { date: '2024-06-01', value: 96 },
        { date: '2024-07-01', value: 95 }
      ]
    },
    {
      id: 'cholesterol',
      parameter: 'TOTAL CHOLESTEROL',
      value: '185',
      unit: 'mg/dL',
      referenceRange: '<200 mg/dL',
      status: 'normal',
      category: 'Lipid Panel',
      history: [
        { date: '2024-01-01', value: 190 },
        { date: '2024-02-01', value: 188 },
        { date: '2024-03-01', value: 192 },
        { date: '2024-04-01', value: 186 },
        { date: '2024-05-01', value: 183 },
        { date: '2024-06-01', value: 181 },
        { date: '2024-07-01', value: 185 }
      ]
    },
    {
      id: 'ldl',
      parameter: 'LDL CHOLESTEROL',
      value: '110',
      unit: 'mg/dL',
      referenceRange: '<100 mg/dL',
      status: 'high',
      category: 'Lipid Panel',
      history: [
        { date: '2024-01-01', value: 115 },
        { date: '2024-02-01', value: 118 },
        { date: '2024-03-01', value: 112 },
        { date: '2024-04-01', value: 108 },
        { date: '2024-05-01', value: 105 },
        { date: '2024-06-01', value: 107 },
        { date: '2024-07-01', value: 110 }
      ]
    }
  ];
};
