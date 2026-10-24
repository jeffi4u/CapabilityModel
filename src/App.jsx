import React, { useState } from 'react';
import { Upload, Database, Layers, Search, Presentation, BarChart2 } from 'lucide-react';
import CapabilityMap from './components/CapabilityMap';
import DetailsPanel from './components/DetailsPanel';
import Dashboard from './components/Dashboard';
import ModelOnAPage from './components/ModelOnAPage';
import { mockData, parseExcelData, filterData } from './dataUtils';

function App() {
  const [modelData, setModelData] = useState(mockData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandLevel, setExpandLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // Start on dashboard

  const filteredData = React.useMemo(() => {
    return filterData(modelData, searchQuery);
  }, [modelData, searchQuery]);

  // Forces Fully Expanded view when actively using the text search
  const effectiveExpandLevel = searchQuery.trim().length > 0 ? 2 : expandLevel;

  const handleSelectNode = (nodeData) => {
    setSelectedNode(nodeData);
    setIsPanelOpen(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const parsedData = await parseExcelData(file);
      setModelData(parsedData);
      console.log("File loaded and parsed successfully.", file.name);
      setTimeout(() => setIsLoading(false), 800);
    } catch (error) {
      console.error("Error parsing file:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon"><Database size={16} /></div>
              <span className="logo-text">WFCM</span>
            </div>

            <div className="actions-section" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  style={{
                    background: currentView === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: currentView === 'dashboard' ? 'white' : 'var(--text-secondary)',
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500
                  }}
                ><BarChart2 size={14} /> Dashboard</button>
                <button
                  onClick={() => setCurrentView('map')}
                  style={{
                    background: currentView === 'map' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: currentView === 'map' ? 'white' : 'var(--text-secondary)',
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500
                  }}
                ><Layers size={14} /> Map</button>
                <button
                  onClick={() => setCurrentView('moap')}
                  style={{
                    background: currentView === 'moap' ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: currentView === 'moap' ? 'white' : 'var(--text-secondary)',
                    padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 500
                  }}
                ><Presentation size={14} /> MOAP</button>
              </div>

              {currentView === 'map' && (
                <div className="toggle-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
                  <button
                    style={{ background: expandLevel === 0 ? 'rgba(255,255,255,0.1)' : 'transparent', color: expandLevel === 0 ? 'white' : 'var(--text-secondary)', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: expandLevel === 0 ? '500' : 'normal', transition: 'all 0.2s' }}
                    onClick={() => setExpandLevel(0)}
                  >Tiers Only</button>
                  <button
                    style={{ background: expandLevel === 1 ? 'rgba(255,255,255,0.1)' : 'transparent', color: expandLevel === 1 ? 'white' : 'var(--text-secondary)', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: expandLevel === 1 ? '500' : 'normal', transition: 'all 0.2s' }}
                    onClick={() => setExpandLevel(1)}
                  >Domains Only</button>
                  <button
                    style={{ background: expandLevel === 2 ? 'rgba(255,255,255,0.1)' : 'transparent', color: expandLevel === 2 ? 'white' : 'var(--text-secondary)', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: expandLevel === 2 ? '500' : 'normal', transition: 'all 0.2s' }}
                    onClick={() => setExpandLevel(2)}
                  >Fully Expanded</button>
                </div>
              )}

              <div className="search-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Filter capabilities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '200px', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />

              <label className="upload-btn">
                <Upload size={16} />
                <span>Load Excel Map</span>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </header>

        <main className="main-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Processing Model...</p>
            </div>
          ) : currentView === 'dashboard' ? (
            <Dashboard data={filteredData} />
          ) : currentView === 'moap' ? (
            <ModelOnAPage data={filteredData} />
          ) : (
            <CapabilityMap
              data={filteredData}
              onSelectNode={handleSelectNode}
              selectedId={selectedNode?.id}
              expandLevel={effectiveExpandLevel}
            />
          )}
        </main>
      </div>

      {isPanelOpen && <DetailsPanel data={selectedNode} onClose={() => setIsPanelOpen(false)} />}
    </div>
  );
}
export default App;
