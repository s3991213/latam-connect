import React from 'react';
import { SentimentData } from '../../types';

interface SentimentChartProps {
  data: SentimentData;
  className?: string;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ data, className }) => {
  // This component simulates a chart
  // In a real implementation, you'd use a charting library like Chart.js or Recharts
  
  const positivePercentage = data.positive;
  const neutralPercentage = data.neutral;
  const negativePercentage = data.negative;
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 ${className}`}>
      <h3 className="text-lg font-medium text-slate-800 mb-4">Sentiment Distribution</h3>
      
      <div className="mb-6">
        <div className="flex h-8 rounded-full overflow-hidden mb-2">
          <div 
            className="bg-emerald-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${positivePercentage}%` }}
          ></div>
          <div 
            className="bg-slate-300 transition-all duration-500 ease-in-out" 
            style={{ width: `${neutralPercentage}%` }}
          ></div>
          <div 
            className="bg-red-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${negativePercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-slate-600">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
            <span>Positive: {positivePercentage}%</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-slate-300 rounded-full mr-2"></span>
            <span>Neutral: {neutralPercentage}%</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span>Negative: {negativePercentage}%</span>
          </div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-slate-700 mb-2">Trend (Last 15 Days)</h4>
      
      <div className="relative h-40 w-full">
        {/* Simulate a line chart */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-200"></div>
        <div className="absolute left-0 bottom-0 top-0 w-px bg-slate-200"></div>
        
        <div className="absolute inset-0 flex items-end justify-between p-px">
          {data.trends.map((point, index) => (
            <div key={index} className="flex flex-col items-center justify-end h-full w-2">
              <div className="relative" style={{ height: `${point.positive}%` }}>
                <div 
                  className="w-1 bg-emerald-500 transition-all duration-500 ease-in-out" 
                  style={{ height: `${point.positive}%` }}
                ></div>
                <div 
                  className="w-1 bg-slate-300 absolute bottom-full left-0 transition-all duration-500 ease-in-out" 
                  style={{ height: `${point.neutral}%` }}
                ></div>
                <div 
                  className="w-1 bg-red-500 absolute bottom-full left-0 transition-all duration-500 ease-in-out" 
                  style={{ height: `${point.negative}%`, top: `-${point.neutral}%` }}
                ></div>
              </div>
              {index % 3 === 0 && (
                <span className="absolute bottom-[-20px] text-[8px] text-slate-500 rotate-90 origin-top-left transform -translate-x-3 translate-y-1">
                  {new Date(point.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;