
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthParameterWithHistory } from '@/contexts/LabReportContext';

interface TrendsChartProps {
  parameters: HealthParameterWithHistory[];
}

export const TrendsChart = ({ parameters }: TrendsChartProps) => {
  const [selectedParameters, setSelectedParameters] = useState<string[]>(
    parameters.slice(0, 3).map(p => p.id)
  );

  // Transform data for chart
  const chartData = parameters[0]?.history.map(historyPoint => {
    const dataPoint: any = { date: new Date(historyPoint.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) };
    
    selectedParameters.forEach(paramId => {
      const param = parameters.find(p => p.id === paramId);
      if (param) {
        const historyValue = param.history.find(h => h.date === historyPoint.date);
        if (historyValue) {
          dataPoint[param.parameter] = historyValue.value;
        }
      }
    });
    
    return dataPoint;
  }) || [];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const handleParameterToggle = (paramId: string) => {
    setSelectedParameters(prev => 
      prev.includes(paramId) 
        ? prev.filter(id => id !== paramId)
        : [...prev, paramId].slice(0, 6) // Limit to 6 parameters
    );
  };

  return (
    <div className="space-y-6">
      {/* Parameter Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Parameters to Display</h3>
        <div className="flex flex-wrap gap-2">
          {parameters.map((param, index) => (
            <button
              key={param.id}
              onClick={() => handleParameterToggle(param.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedParameters.includes(param.id)
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span>{param.parameter}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {selectedParameters.length > 0 ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {selectedParameters.map((paramId, index) => {
                const param = parameters.find(p => p.id === paramId);
                return param ? (
                  <Line
                    key={paramId}
                    type="monotone"
                    dataKey={param.parameter}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: colors[index % colors.length], strokeWidth: 2, fill: 'white' }}
                  />
                ) : null;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          Select at least one parameter to view trends
        </div>
      )}

      {/* Trend Insights */}
      {selectedParameters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedParameters.map(paramId => {
            const param = parameters.find(p => p.id === paramId);
            if (!param || param.history.length < 2) return null;

            const firstValue = param.history[0].value;
            const lastValue = param.history[param.history.length - 1].value;
            const change = lastValue - firstValue;
            const percentChange = (change / firstValue) * 100;

            return (
              <div key={paramId} className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{param.parameter}</h4>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    Latest: <span className="font-medium">{lastValue} {param.unit}</span>
                  </div>
                  <div className={`text-sm flex items-center space-x-1 ${
                    change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    <span>Trend: </span>
                    <span className="font-medium">
                      {change > 0 ? '↗' : change < 0 ? '↘' : '→'} 
                      {Math.abs(percentChange).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
