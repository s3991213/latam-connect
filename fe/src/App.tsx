import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/NewsSearchFilter';
import SentimentAnalysis from './pages/ProfileSearchFilter';
import Settings from './pages/Settings';
import { NewsProvider } from './context/NewsContext';

import Articles from './pages/Articles';
import Companies from './pages/Companies';
import MediaReports from './pages/MediaReports';
import NewsSearchFilter from './pages/NewsSearchFilter';
import ProfileSearchFilter from './pages/ProfileSearchFilter';

function App() {
  return (
    <NewsProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<NewsSearchFilter />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/profilesearchfilter" element={<ProfileSearchFilter />} />
            <Route path="/mediareports" element={<MediaReports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </NewsProvider>
  );
}

export default App;