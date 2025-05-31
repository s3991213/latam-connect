import React, { useState } from 'react';
import { Entity } from '../../types';

interface EntityNetworkProps {
  entities: Entity[];
  className?: string;
}

const EntityNetwork: React.FC<EntityNetworkProps> = ({ entities, className }) => {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  
  // For a real implementation, you'd use a proper network visualization library
  // like D3.js, Sigma.js, or react-force-graph
  
  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'bg-blue-500';
      case 'person':
        return 'bg-purple-500';
      case 'location':
        return 'bg-amber-500';
      case 'metric':
        return 'bg-emerald-500';
      default:
        return 'bg-slate-500';
    }
  };
  
  const getEntityTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  const handleEntityClick = (id: string) => {
    setSelectedEntity(id === selectedEntity ? null : id);
  };
  
  // Find the selected entity and its related entities
  const selectedEntityData = selectedEntity 
    ? entities.find(e => e.id === selectedEntity)
    : null;
    
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-medium text-slate-800">Entity Relationships</h3>
        <p className="text-sm text-slate-500 mt-1">
          Discover connections between companies, people, and locations
        </p>
      </div>
      
      <div className="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm text-slate-500">Key entities:</span>
          {entities.slice(0, 5).map(entity => (
            <button
              key={entity.id}
              onClick={() => handleEntityClick(entity.id)}
              className={`text-xs px-2 py-1 rounded-full flex items-center ${
                selectedEntity === entity.id
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-1.5 ${getEntityTypeColor(entity.type)}`}></span>
              {entity.name}
            </button>
          ))}
        </div>
        
        {/* Network visualization */}
        <div className="relative h-64 border border-slate-100 rounded-lg overflow-hidden bg-slate-50">
          {selectedEntityData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="network-visualization">
                {/* Central entity */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getEntityTypeColor(selectedEntityData.type)} text-white font-medium shadow-lg border-2 border-white`}>
                    {selectedEntityData.name.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-medium text-slate-800">{selectedEntityData.name}</div>
                    <div className="text-xs text-slate-500">{getEntityTypeLabel(selectedEntityData.type)}</div>
                  </div>
                </div>
                
                {/* Related entities */}
                {selectedEntityData.relatedEntities.map((related, index) => {
                  const angle = (index * 2 * Math.PI) / selectedEntityData.relatedEntities.length;
                  const radius = 130; // Distance from center
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div 
                      key={related.id}
                      className="absolute"
                      style={{
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getEntityTypeColor(related.type)} text-white font-medium shadow border-2 border-white`}
                        style={{ opacity: related.strength }}
                      >
                        {related.name.split(' ').map(word => word[0]).join('')}
                      </div>
                      <div className="mt-1 text-center">
                        <div className="text-xs font-medium text-slate-800">{related.name}</div>
                        <div className="text-[10px] text-slate-500">{getEntityTypeLabel(related.type)}</div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Lines connecting entities */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {selectedEntityData.relatedEntities.map((related, index) => {
                    const angle = (index * 2 * Math.PI) / selectedEntityData.relatedEntities.length;
                    const radius = 130;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <line
                        key={`line-${related.id}`}
                        x1="50%"
                        y1="50%"
                        x2={`calc(50% + ${x}px)`}
                        y2={`calc(50% + ${y}px)`}
                        stroke="#94a3b8"
                        strokeWidth={related.strength * 3}
                        strokeOpacity={0.5}
                        strokeDasharray={related.type === 'location' ? "5,5" : ""}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Select an entity to view relationships
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></span>
            <span className="text-xs text-slate-600">Company</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-purple-500 mr-1.5"></span>
            <span className="text-xs text-slate-600">Person</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 mr-1.5"></span>
            <span className="text-xs text-slate-600">Location</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></span>
            <span className="text-xs text-slate-600">Metric</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityNetwork;