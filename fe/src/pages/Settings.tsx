import React, { useState } from 'react';
import { Save, Plus, Bell, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { AlertSettings } from '../types';

const Settings: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertSettings[]>([
    {
      id: '1',
      keyword: 'Layoffs',
      sources: ['All Sources'],
      threshold: 'high',
      frequency: 'immediate',
      enabled: true
    },
    {
      id: '2',
      keyword: 'Merger',
      sources: ['Bloomberg', 'Wall Street Journal'],
      threshold: 'medium',
      frequency: 'daily',
      enabled: true
    },
    {
      id: '3',
      keyword: 'Tesla',
      sources: ['All Sources'],
      threshold: 'low',
      frequency: 'weekly',
      enabled: false
    }
  ]);
  
  const [newAlertOpen, setNewAlertOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['All Sources']);
  const [selectedThreshold, setSelectedThreshold] = useState<'all' | 'high' | 'medium' | 'low'>('medium');
  const [selectedFrequency, setSelectedFrequency] = useState<'immediate' | 'daily' | 'weekly'>('daily');
  
  const sources = [
    'All Sources',
    'TechCrunch',
    'Bloomberg',
    'Wall Street Journal',
    'CNBC',
    'Reuters',
    'Financial Times'
  ];
  
  const handleAddAlert = () => {
    if (!newKeyword.trim()) return;
    
    const newAlert: AlertSettings = {
      id: Date.now().toString(),
      keyword: newKeyword,
      sources: selectedSources,
      threshold: selectedThreshold,
      frequency: selectedFrequency,
      enabled: true
    };
    
    setAlerts([...alerts, newAlert]);
    setNewKeyword('');
    setSelectedSources(['All Sources']);
    setSelectedThreshold('medium');
    setSelectedFrequency('daily');
    setNewAlertOpen(false);
  };
  
  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };
  
  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  const handleSourceToggle = (source: string) => {
    if (source === 'All Sources') {
      setSelectedSources(['All Sources']);
    } else {
      const newSources = selectedSources.includes(source)
        ? selectedSources.filter(s => s !== source)
        : [...selectedSources.filter(s => s !== 'All Sources'), source];
      
      setSelectedSources(newSources.length ? newSources : ['All Sources']);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500">Configure your news alerts and preferences</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-slate-800">News Alerts</h2>
              <p className="text-sm text-slate-500 mt-1">
                Get notified when important business news breaks
              </p>
            </div>
            <button
              onClick={() => setNewAlertOpen(!newAlertOpen)}
              className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Alert
            </button>
          </div>
          
          {/* New Alert Form */}
          {newAlertOpen && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Create New Alert</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="keyword" className="block text-xs font-medium text-slate-600 mb-1">
                    Keyword or Phrase
                  </label>
                  <input
                    id="keyword"
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Enter keyword or phrase"
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Alert Frequency
                  </label>
                  <select
                    value={selectedFrequency}
                    onChange={(e) => setSelectedFrequency(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Sources
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-lg p-2">
                    {sources.map(source => (
                      <div key={source} className="mb-1 last:mb-0">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedSources.includes(source)}
                            onChange={() => handleSourceToggle(source)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 mr-2"
                          />
                          <span className="text-sm text-slate-700">{source}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Importance Threshold
                  </label>
                  <select
                    value={selectedThreshold}
                    onChange={(e) => setSelectedThreshold(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                  >
                    <option value="all">All Mentions</option>
                    <option value="high">High Importance Only</option>
                    <option value="medium">Medium Importance or Higher</option>
                    <option value="low">Low Importance or Higher</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setNewAlertOpen(false)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAlert}
                  className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Alert
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Alerts List */}
        <div className="divide-y divide-slate-200">
          {alerts.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Bell className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No alerts configured</h3>
              <p className="text-slate-500 mb-4">
                Add your first alert to stay informed about important business news.
              </p>
              <button
                onClick={() => setNewAlertOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </button>
            </div>
          ) : (
            alerts.map(alert => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onToggle={handleToggleAlert}
                onDelete={handleDeleteAlert}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-medium text-slate-800">Display Settings</h2>
          <p className="text-sm text-slate-500 mt-1">
            Customize your news viewing experience
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Theme Preference</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked
                  className="text-emerald-600 focus:ring-emerald-500 mr-2"
                />
                <span className="text-sm text-slate-700">Light</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="text-emerald-600 focus:ring-emerald-500 mr-2"
                />
                <span className="text-sm text-slate-700">Dark</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  className="text-emerald-600 focus:ring-emerald-500 mr-2"
                />
                <span className="text-sm text-slate-700">System</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Default News Sorting</h3>
            <select
              className="w-full md:w-auto py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date (Newest First)</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">News Card Display</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="display"
                  value="detailed"
                  checked
                  className="text-emerald-600 focus:ring-emerald-500 mr-2"
                />
                <span className="text-sm text-slate-700">Detailed</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="display"
                  value="compact"
                  className="text-emerald-600 focus:ring-emerald-500 mr-2"
                />
                <span className="text-sm text-slate-700">Compact</span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AlertItemProps {
  alert: AlertSettings;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onToggle, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getThresholdLabel = (threshold: string) => {
    switch (threshold) {
      case 'high':
        return 'High Importance Only';
      case 'medium':
        return 'Medium Importance or Higher';
      case 'low':
        return 'Low Importance or Higher';
      default:
        return 'All Mentions';
    }
  };
  
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'Immediate';
      case 'daily':
        return 'Daily Digest';
      case 'weekly':
        return 'Weekly Summary';
      default:
        return '';
    }
  };
  
  return (
    <div className={`p-4 ${alert.enabled ? 'bg-white' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => onToggle(alert.id)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
              alert.enabled ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                alert.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></span>
          </button>
          
          <div className="ml-3">
            <h3 className={`font-medium ${alert.enabled ? 'text-slate-800' : 'text-slate-500'}`}>
              {alert.keyword}
            </h3>
            <p className="text-xs text-slate-500">
              {getFrequencyLabel(alert.frequency)} • {alert.sources.join(', ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-slate-600 mb-1">Keyword</h4>
              <input
                type="text"
                value={alert.keyword}
                disabled
                className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
              />
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-slate-600 mb-1">Alert Frequency</h4>
              <select
                defaultValue={alert.frequency}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-slate-600 mb-1">Sources</h4>
              <div className="text-sm text-slate-700 bg-slate-50 border border-slate-300 rounded-lg p-2 h-20 overflow-y-auto">
                {alert.sources.map((source, index) => (
                  <div key={index} className="flex items-center mb-1 last:mb-0">
                    <Check className="h-3 w-3 text-emerald-500 mr-1.5" />
                    {source}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-slate-600 mb-1">Importance Threshold</h4>
              <select
                defaultValue={alert.threshold}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
              >
                <option value="all">All Mentions</option>
                <option value="high">High Importance Only</option>
                <option value="medium">Medium Importance or Higher</option>
                <option value="low">Low Importance or Higher</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Update Alert
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;