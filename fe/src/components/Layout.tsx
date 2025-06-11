import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Newspaper, 
  Network, 
  TrendingUp, 
  Tag, 
  Settings, 
  Menu, 
  X,
  Search,
  BellRing,
  BookOpen
} from 'lucide-react';
import { useNews } from '../context/NewsContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { filters, updateFilters } = useNews();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query') as string;
    updateFilters({ query });
    setSearchOpen(false);
  };

  const navItems = [
    // { name: 'Search', path: '/', icon: <BarChart3 className="h-5 w-5" /> },
    // { name: 'Articles', path: '/articles', icon: <Newspaper className="h-5 w-5" /> },
    { name: 'Companies', path: '/companies', icon: <Network className="h-5 w-5" /> },
    { name: 'Profile Search Filter', path: '/', icon: <TrendingUp className="h-5 w-5" /> },
    // { name: 'Media Reports', path: '/mediareports', icon: <Tag className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="fixed z-20 top-4 left-4 md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md bg-white shadow-md text-slate-700 hover:bg-slate-50"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-slate-800 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-slate-700">
          <BookOpen className="h-6 w-6 mr-2 text-emerald-400" />
          <h1 className="text-xl font-bold">InsightPulse</h1>
        </div>
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-slate-700 text-emerald-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full text-slate-600 hover:bg-slate-100"
              >
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 relative">
                <BellRing className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500"></span>
              </button>
              <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                JP
              </div>
            </div>
          </div>

          {/* Search overlay */}
          {searchOpen && (
            <div className="absolute inset-0 z-20 bg-white/95 flex items-start justify-center pt-20 px-4">
              <div className="w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-slate-800">Search News & Insights</h3>
                  <button
                    onClick={toggleSearch}
                    className="p-2 rounded-full text-slate-600 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    name="query"
                    placeholder="Search by keyword, company, or topic..."
                    className="w-full py-3 px-4 pr-10 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    autoFocus
                    defaultValue={filters.query}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-3 text-slate-400 hover:text-emerald-500"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Trending Searches</h4>
                  <div className="flex flex-wrap gap-2">
                    {['AI', 'Layoffs', 'Tesla', 'Crypto ETF', 'Climate Tech'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          updateFilters({ query: term });
                          setSearchOpen(false);
                        }}
                        className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;