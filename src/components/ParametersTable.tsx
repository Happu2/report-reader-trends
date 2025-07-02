
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { HealthParameterWithHistory } from '@/contexts/LabReportContext';

interface ParametersTableProps {
  parameters: HealthParameterWithHistory[];
}

export const ParametersTable = ({ parameters }: ParametersTableProps) => {
  const [sortBy, setSortBy] = useState<'parameter' | 'status' | 'category'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleSort = (field: 'parameter' | 'status' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const categories = ['all', ...Array.from(new Set(parameters.map(p => p.category)))];

  const filteredAndSortedParameters = parameters
    .filter(p => filterCategory === 'all' || p.category === filterCategory)
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'status') {
        const statusOrder = { 'critical': 0, 'high': 1, 'low': 2, 'normal': 3 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <ArrowUp className="h-5 w-5 text-orange-600" />;
      case 'low':
        return <ArrowDown className="h-5 w-5 text-yellow-600" />;
      case 'normal':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'high':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'low':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'normal':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getInsight = (param: HealthParameterWithHistory) => {
    switch (param.status) {
      case 'critical':
        return `Critical level detected. Immediate medical attention recommended.`;
      case 'high':
        return `Above normal range. Consider lifestyle modifications and consult your healthcare provider.`;
      case 'low':
        return `Below normal range. May need nutritional or medical intervention.`;
      case 'normal':
        return `Within healthy range. Keep up the good work!`;
      default:
        return 'Status unclear. Please consult your healthcare provider.';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Category:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedParameters.length} of {parameters.length} parameters
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-4 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('parameter')}
              >
                <div className="flex items-center space-x-2">
                  <span>Parameter</span>
                  {sortBy === 'parameter' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Value</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Reference Range</th>
              <th 
                className="text-left py-4 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span>Status</span>
                  {sortBy === 'status' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center space-x-2">
                  <span>Category</span>
                  {sortBy === 'category' && (
                    sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">AI Insight</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedParameters.map((param, index) => (
              <tr key={param.id} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900">{param.parameter}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{param.value}</span>
                    <span className="text-gray-600">{param.unit}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600">{param.referenceRange}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(param.status)}
                    <span className={getStatusBadge(param.status)}>
                      {param.status.charAt(0).toUpperCase() + param.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {param.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600 max-w-xs">
                  {getInsight(param)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedParameters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No parameters found for the selected category.
        </div>
      )}
    </div>
  );
};
