import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNews } from '../context/NewsContext';

const FilterBar: React.FC = () => {
  const { filters, updateFilters } = useNews();
  const [expanded, setExpanded] = useState(false);

  const topics = [
    'AI', 'Technology', 'Business Intelligence', 'Earnings', 'Automotive', 
    'Electric Vehicles', 'Layoffs', 'E-commerce', 'Restructuring', 
    'Cryptocurrency', 'Regulation', 'Investment', 'Retail', 'Supply Chain',
    'Banking', 'Fintech', 'Mergers & Acquisitions', 'Climate Tech', 
    'Venture Capital', 'Sustainability'
  ];

  const sources = [
    'TechCrunch', 'Bloomberg', 'Wall Street Journal', 'CNBC', 
    'Reuters', 'Financial Times'
  ];

  const handleTopicToggle = (topic: string) => {
    const currentTopics = [...filters.topics];
    if (currentTopics.includes(topic)) {
      updateFilters({ topics: currentTopics.filter(t => t !== topic) });
    } else {
      updateFilters({ topics: [...currentTopics, topic] });
    }
  };

  const handleSourceToggle = (source: string) => {
    const currentSources = [...filters.sources];
    if (currentSources.includes(source)) {
      updateFilters({ sources: currentSources.filter(s => s !== source) });
    } else {
      updateFilters({ sources: [...currentSources, source] });
    }
  };

  const handleSortChange = (sortBy: 'relevance' | 'date' | 'popularity') => {
    updateFilters({ sortBy });
  };

  const handleSentimentChange = (sentiment: 'positive' | 'negative' | 'neutral' | 'all') => {
    updateFilters({ sentiment });
  };

  const resetFilters = () => {
    updateFilters({
      topics: [],
      sources: [],
      sentiment: 'all',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = 
    filters.topics.length > 0 || 
    filters.sources.length > 0 || 
    filters.sentiment !== 'all' || 
    filters.sortBy !== 'relevance';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-slate-500 mr-2" />
            <h3 className="font-medium text-slate-800">Filters</h3>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">
                {filters.topics.length + filters.sources.length + (filters.sentiment !== 'all' ? 1 : 0) + (filters.sortBy !== 'relevance' ? 1 : 0)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center"
              >
                <X className="h-3 w-3 mr-1" /> Clear all
              </button>
            )}
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-slate-500 hover:text-slate-700"
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Filter selections - only shown when expanded */}
        {expanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Topics */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Topics</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2">
                {topics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      filters.topics.includes(topic)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sources */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Sources</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map(source => (
                  <button
                    key={source}
                    onClick={() => handleSourceToggle(source)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      filters.sources.includes(source)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sentiment */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Sentiment</h4>
              <div className="flex flex-wrap gap-2">
                {['all', 'positive', 'neutral', 'negative'].map(sentiment => (
                  <button
                    key={sentiment}
                    onClick={() => handleSentimentChange(sentiment as any)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      filters.sentiment === sentiment
                        ? sentiment === 'positive' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : sentiment === 'negative'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : sentiment === 'neutral'
                          ? 'bg-slate-200 text-slate-800 border border-slate-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sort By */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Sort By</h4>
              <div className="flex flex-wrap gap-2">
                {['relevance', 'date', 'popularity'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => handleSortChange(sort as any)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      filters.sortBy === sort
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Active filters */}
      {hasActiveFilters && !expanded && (
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {filters.topics.map(topic => (
            <div key={topic} className="flex items-center bg-slate-100 text-slate-700 text-xs rounded-full px-2 py-0.5">
              <span className="mr-1">{topic}</span>
              <button onClick={() => handleTopicToggle(topic)}>
                <X className="h-3 w-3 text-slate-500 hover:text-slate-700" />
              </button>
            </div>
          ))}
          
          {filters.sources.map(source => (
            <div key={source} className="flex items-center bg-slate-100 text-slate-700 text-xs rounded-full px-2 py-0.5">
              <span className="mr-1">{source}</span>
              <button onClick={() => handleSourceToggle(source)}>
                <X className="h-3 w-3 text-slate-500 hover:text-slate-700" />
              </button>
            </div>
          ))}
          
          {filters.sentiment !== 'all' && (
            <div className={`flex items-center text-xs rounded-full px-2 py-0.5 ${
              filters.sentiment === 'positive' 
                ? 'bg-emerald-100 text-emerald-800' 
                : filters.sentiment === 'negative'
                ? 'bg-red-100 text-red-800'
                : 'bg-slate-100 text-slate-800'
            }`}>
              <span className="mr-1">Sentiment: {filters.sentiment}</span>
              <button onClick={() => handleSentimentChange('all')}>
                <X className="h-3 w-3 hover:text-slate-700" />
              </button>
            </div>
          )}
          
          {filters.sortBy !== 'relevance' && (
            <div className="flex items-center bg-slate-100 text-slate-700 text-xs rounded-full px-2 py-0.5">
              <span className="mr-1">Sort: {filters.sortBy}</span>
              <button onClick={() => handleSortChange('relevance')}>
                <X className="h-3 w-3 text-slate-500 hover:text-slate-700" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;