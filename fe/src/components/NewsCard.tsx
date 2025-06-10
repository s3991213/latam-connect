import React from 'react';
import { ExternalLink, ThumbsUp, ThumbsDown, BookmarkPlus } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsCardProps {
  news: NewsItem;
  compact?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, compact = false }) => {
  const formattedDate = new Date(news.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-100 text-emerald-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-slate-500">{news.source}</span>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
          <h3 className="font-medium text-slate-800 mb-1 line-clamp-2">{news.title}</h3>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(news.sentiment)}`}>
              {news.sentiment}
            </span>
            {news.topics.slice(0, 1).map((topic) => (
              <span
                key={topic}
                className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {news.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(news.sentiment)}`}>
                {news.sentiment}
              </span>
              <span className="text-xs text-white ml-2">{formattedDate}</span>
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="text-sm font-medium text-slate-500">{news.source}</span>
          {!news.image && <span className="text-xs text-slate-400">{formattedDate}</span>}
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">{news.title}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{news.summary}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {news.topics.map((topic) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
            >
              {topic}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center space-x-3">
            <button className="flex items-center text-slate-400 hover:text-emerald-500">
              <ThumbsUp className="h-4 w-4 mr-1" />
            </button>
            <button className="flex items-center text-slate-400 hover:text-red-500">
              <ThumbsDown className="h-4 w-4 mr-1" />
            </button>
            <button className="flex items-center text-slate-400 hover:text-amber-500">
              <BookmarkPlus className="h-4 w-4 mr-1" />
            </button>
          </div>
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-emerald-600 flex items-center"
          >
            Read <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;