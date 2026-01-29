
import React, { useState, useEffect } from 'react';
import { MindMapNode } from '../types';

interface MindMapCanvasProps {
  data: MindMapNode;
  onClose: () => void;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ data, onClose }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([data.id]));
  const [activeDescription, setActiveDescription] = useState<string | null>(null);

  const toggleNode = (id: string, description?: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
    if (description) setActiveDescription(description);
  };

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Box */}
        <div 
          onClick={() => toggleNode(node.id, node.description)}
          className={`
            relative z-10 px-4 py-2 rounded-xl shadow-md cursor-pointer select-none transition-all duration-300 transform hover:scale-105
            ${level === 0 ? 'bg-indigo-600 text-white text-lg font-bold min-w-[150px]' : 
              level === 1 ? 'bg-white border-2 border-indigo-400 text-indigo-900 font-semibold' : 
              'bg-white border border-gray-200 text-gray-700 text-sm'}
          `}
        >
          {node.label}
          {hasChildren && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-indigo-200 rounded-full flex items-center justify-center text-xs text-indigo-600 shadow-sm">
              {isExpanded ? <i className="fa-solid fa-minus"></i> : <i className="fa-solid fa-plus"></i>}
            </div>
          )}
        </div>

        {/* Children Branches */}
        {isExpanded && hasChildren && (
          <div className="mt-8 flex gap-8 relative">
            {/* Vertical connector from parent */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-indigo-200" />
            
            {/* Horizontal bridge for branches */}
            <div className="absolute top-0 left-[25%] right-[25%] h-0.5 bg-indigo-200" style={{
              display: node.children!.length > 1 ? 'block' : 'none'
            }} />

            {node.children!.map((child) => (
              <div key={child.id} className="relative">
                {renderNode(child, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <header className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <i className="fa-solid fa-diagram-project text-indigo-600"></i>
          Sơ đồ tư duy: {data.label}
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </header>

      <div className="flex-1 relative overflow-auto p-12 flex justify-center bg-[#f8faff]">
        <div className="min-w-max">
          {renderNode(data)}
        </div>
      </div>

      {activeDescription && (
        <div className="absolute bottom-6 right-6 max-w-sm bg-white p-4 rounded-lg shadow-xl border border-indigo-100 animate-slide-up">
          <h3 className="font-bold text-indigo-900 mb-2">Chi tiết kiến thức</h3>
          <p className="text-gray-600 text-sm">{activeDescription}</p>
          <button 
            onClick={() => setActiveDescription(null)}
            className="mt-3 text-xs text-indigo-600 hover:underline"
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default MindMapCanvas;
