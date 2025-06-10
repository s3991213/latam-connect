export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  content: string;
  image?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  entities: {
    companies: string[];
    people: string[];
    locations: string[];
    metrics: { label: string; value: string }[];
  };
  score: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'company' | 'person' | 'location' | 'metric';
  count: number;
  sentiment: { positive: number; neutral: number; negative: number };
  relatedEntities: { id: string; name: string; type: string; strength: number }[];
  recentMentions: { newsId: string; title: string; publishedAt: string }[];
}

export interface Topic {
  id: string;
  name: string;
  count: number;
  trending: boolean;
  sentiment: { positive: number; neutral: number; negative: number };
  topArticles: { id: string; title: string; source: string }[];
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  trends: { date: string; positive: number; neutral: number; negative: number }[];
}

export interface NewsFilters {
  query: string;
  sources: string[];
  startDate: Date | null;
  endDate: Date | null;
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  sortBy: 'relevance' | 'date' | 'popularity';
}

export interface Source {
  id: string;
  name: string;
  logo?: string;
  category: string;
}

export interface AlertSettings {
  id: string;
  keyword: string;
  sources: string[];
  threshold: 'all' | 'high' | 'medium' | 'low';
  frequency: 'immediate' | 'daily' | 'weekly';
  enabled: boolean;
}

// ======================================================================//
export type Article = {
  _id: string;
  ID: number;
  URL: string;
  "Título": string;
  "Descripción en una frase": string;
  Resumen: string;
  "Nombres de personas": string;
  Puesto: string;
  Empresa: string;
  "Instituciones nombradas": string;
  "Personas de instituciones": string;
  "Personas de instituciones_2": string;
  "Personas de instituciones_3": string;
  "Personas de instituciones_4": string;
  Categoría: string;
};



export type Company = {
  _id: string | { $oid: string };
  ID: number;
  "Empresa protagonista (Nombre)": string;
  Titulo: string;
  "Descripción breve": string;
  Resumen: string;
  "Founder 1": string;
  "Founder 2": string;
  "Founder 3": string;
  "Other Founders": string;
  "Categoría/Sector": string;
  "Player 1": string;
  "Player 2": string;
  "Player 3": string;
  "Other Player": string;
  "Ubicación": string;
  "Año de fundación": number;
  "Fecha de publicación": string;
  "Crecimiento reciente": string;
  "Servicio principal": string;
  "Clientes principales": string;
  "Enfoque de inversión": string;
  "Experiencia de fundadores": string;
  "Etapa de desarrollo": string;
  "Noticia propia o resumen?": string;
  "URL de la fuente original": string;
  "Alianzas y colaboraciones": string;
  "Instrumentos financieros mencionados": string;
  "Infraestructura de innovación": string;
  "Proyectos destacados": string;
  "Metas futuras": string;
  "Impacto esperado": string;
  "Declaraciones destacadas": string;
  "Comentarios (del analista)": string;
};


export type MediaReport = {
  _id: string | { $oid: string };
  ID: number;
  URL: string;
  Source: string;
  "Pais Fuente": string;
  "Fecha Publicación": string;
  "Aclaración": string;
  "Tema Principal": string;
  "Monto/Impacto": string;
  "Alcance Medio": string;
  Sector: string;
  "Relevancia Geográfica": string;
  Score: string;
  Title: string;
  "Full Text": string;
};
