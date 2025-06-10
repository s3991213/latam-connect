import { NewsItem, NewsFilters, Entity, Topic, SentimentData } from '../types';
import { mockNews, mockEntities, mockSentiment, mockTopics } from './mockData';

// In a real application, these would make API calls to a backend service
// For demonstration purposes, we're using mock data with a simulated delay

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchNews = async (filters: NewsFilters): Promise<NewsItem[]> => {
  await delay(800);
  
  let filtered = [...mockNews];
  
  // Apply filters
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content.toLowerCase().includes(query)
    );
  }
  
  if (filters.sentiment !== 'all') {
    filtered = filtered.filter(item => item.sentiment === filters.sentiment);
  }
  
  if (filters.topics.length > 0) {
    filtered = filtered.filter(item => 
      item.topics.some(topic => filters.topics.includes(topic))
    );
  }
  
  if (filters.sources.length > 0) {
    filtered = filtered.filter(item => 
      filters.sources.includes(item.source)
    );
  }
  
  // Sort results
  if (filters.sortBy === 'date') {
    filtered.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  } else if (filters.sortBy === 'relevance') {
    filtered.sort((a, b) => b.score - a.score);
  }
  
  return filtered;
};

export const fetchEntities = async (filters: NewsFilters): Promise<Entity[]> => {
  await delay(600);
  return mockEntities;
};

export const fetchSentiment = async (filters: NewsFilters): Promise<SentimentData> => {
  await delay(700);
  return mockSentiment;
};

export const fetchTopics = async (filters: NewsFilters): Promise<Topic[]> => {
  await delay(500);
  return mockTopics;
};

export const enrichEntityData = async (entityId: string): Promise<Entity> => {
  await delay(900);
  const entity = mockEntities.find(e => e.id === entityId);
  if (!entity) {
    throw new Error('Entity not found');
  }
  return entity;
};

export const getArticleDetails = async (articleId: string): Promise<NewsItem> => {
  await delay(600);
  const article = mockNews.find(a => a.id === articleId);
  if (!article) {
    throw new Error('Article not found');
  }
  return article;
};

// ============================================================ //
// services/api.ts

import { Article, Company, MediaReport } from '../types';

/**
 * Base URL for FastAPI backend.
 */
const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch all articles from the backend.
 * GET /articles/
 */
export const fetchArticles = async (): Promise<Article[]> => {
  const res = await fetch(`${API_BASE_URL}/articles/`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
};

/**
 * Fetch a single article by its MongoDB string ID.
 * GET /articles/{article_id}
 */
export const fetchArticleById = async (articleId: string): Promise<Article> => {
  const res = await fetch(`${API_BASE_URL}/articles/${articleId}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
};

/**
 * Fetch articles by company name.
 * GET /articles/?empresa={companyName}
 */
export const fetchArticlesByEmpresa = async (empresa: string): Promise<Article[]> => {
  const res = await fetch(`${API_BASE_URL}/articles/?empresa=${encodeURIComponent(empresa)}`);
  if (!res.ok) throw new Error('Failed to fetch articles by empresa');
  return res.json();
};

/**
 * Fetch all companies from the backend.
 * GET /companies/
 */
export const fetchCompanies = async (): Promise<Company[]> => {
  const res = await fetch(`${API_BASE_URL}/companies/`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  return res.json();
};

/**
 * Fetch a single company by its MongoDB string ID.
 * GET /companies/{company_id}
 */
export const fetchCompanyById = async (companyId: string): Promise<Company> => {
  const res = await fetch(`${API_BASE_URL}/companies/${companyId}`);
  if (!res.ok) throw new Error('Company not found');
  return res.json();
};

/**
 * Fetch companies by company name.
 * GET /companies/?empresa={companyName}
 */
export const fetchCompaniesByEmpresa = async (empresa: string): Promise<Company[]> => {
  const res = await fetch(`${API_BASE_URL}/companies/?empresa=${encodeURIComponent(empresa)}`);
  if (!res.ok) throw new Error('Failed to fetch companies by empresa');
  return res.json();
};

/**
 * Fetch all media reports from the backend.
 * GET /media_reports/
 */
export const fetchMediaReports = async (): Promise<MediaReport[]> => {
  const res = await fetch(`${API_BASE_URL}/media_reports/`);
  if (!res.ok) throw new Error('Failed to fetch media reports');
  return res.json();
};

/**
 * Fetch a single media report by its MongoDB string ID.
 * GET /media_reports/{media_report_id}
 */
export const fetchMediaReportById = async (mediaReportId: string): Promise<MediaReport> => {
  const res = await fetch(`${API_BASE_URL}/media_reports/${mediaReportId}`);
  if (!res.ok) throw new Error('Media report not found');
  return res.json();
};

/**
 * Fetch media reports by company name.
 * GET /media_reports/?empresa={companyName}
 */
export const fetchMediaReportsByEmpresa = async (empresa: string): Promise<MediaReport[]> => {
  const res = await fetch(`${API_BASE_URL}/media_reports/?empresa=${encodeURIComponent(empresa)}`);
  if (!res.ok) throw new Error('Failed to fetch media reports by empresa');
  return res.json();
};
