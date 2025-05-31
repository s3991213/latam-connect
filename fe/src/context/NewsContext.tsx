import React, { createContext, useState, useContext, useEffect } from 'react';
import { Article } from '../types';
import { fetchArticles } from '../services/api';

// Define filters you actually support (customize as needed)
interface ArticleFilters {
  query: string;
  // Add more filters if your backend supports them (e.g., date range)
}

interface NewsContextType {
  articles: Article[];
  isLoading: boolean;
  filters: ArticleFilters;
  updateFilters: (newFilters: Partial<ArticleFilters>) => void;
  refreshData: () => void;
}

// Default filter values
const defaultFilters: ArticleFilters = {
  query: '',
};

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ArticleFilters>(defaultFilters);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let data = await fetchArticles();

      // Filter on frontend if needed (if backend doesn't support filtering)
      if (filters.query) {
        const q = filters.query.toLowerCase();
        data = data.filter(
          article =>
            article.Título.toLowerCase().includes(q) ||
            article.Resumen.toLowerCase().includes(q)
        );
      }

      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  const updateFilters = (newFilters: Partial<ArticleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refreshData = () => {
    fetchData();
  };

  const value = {
    articles,
    isLoading,
    filters,
    updateFilters,
    refreshData,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
