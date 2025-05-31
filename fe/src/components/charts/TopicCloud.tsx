import React from 'react';
import { Topic } from '../../types';

interface TopicCloudProps {
  topics: Topic[];
  className?: string;
}

const TopicCloud: React.FC<TopicCloudProps> = ({ topics, className }) => {
  const getSize = (count: number) => {
    const max = Math.max(...topics.map(t => t.count));
    const min = Math.min(...topics.map(t => t.count));
    const normalized = (count - min) / (max - min);
    return 0.8 + normalized * 1.2; // Size between 0.8 and 2.0 em
  };

  const getSentimentColor = (topic: Topic) => {
    const { positive, negative, neutral } = topic.sentiment;
    
    if (positive > negative && positive > neutral) {
      return 'text-emerald-600';
    } else if (negative > positive && negative > neutral) {
      return 'text-red-600';
    } else {
      return 'text-slate-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 ${className}`}>
      <h3 className="text-lg font-medium text-slate-800 mb-4">Topic Distribution</h3>
      
      <div className="flex flex-wrap gap-x-4 gap-y-6 py-3">
        {topics.map((topic) => (
          <button
            key={topic.id}
            className={`${getSentimentColor(topic)} hover:opacity-80 font-medium transition-all duration-300 transform hover:scale-105 ${topic.trending ? 'underline decoration-amber-400 decoration-2 underline-offset-4' : ''}`}
            style={{ fontSize: `${getSize(topic.count)}em` }}
          >
            {topic.name}
            {topic.trending && (
              <span className="ml-1 inline-block w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        ))}
      </div>
      
      <div className="flex mt-4 text-sm">
        <div className="flex items-center mr-6">
          <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
          <span className="text-slate-600">Positive Sentiment</span>
        </div>
        <div className="flex items-center mr-6">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          <span className="text-slate-600">Negative Sentiment</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
          <span className="text-slate-600">Trending</span>
        </div>
      </div>
    </div>
  );
};

export default TopicCloud;