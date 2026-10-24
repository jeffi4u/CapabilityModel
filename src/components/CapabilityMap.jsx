import React from 'react';
import CapabilityNode from './CapabilityNode';

const CapabilityMap = ({ data, onSelectNode, selectedId, expandLevel = 1 }) => {
    if (!data || !data.children) return null;

    return (
        <div className="map-container">
            <div className="map-header glass-panel">
                <div>
                    <h1 className="gradient-text">Model Overview</h1>
                    <p className="subtitle">Interactive nested view</p>
                </div>
            </div>

            <div className="map-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {data.children.map(tierNode => (
                    <div key={tierNode.id} className="tier-section">
                        {tierNode.level === 0 ? (
                            <>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-purple)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>{tierNode.name}</h2>
                                {expandLevel > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start' }}>
                                        {tierNode.children && tierNode.children.map(domainNode => (
                                            <CapabilityNode
                                                key={domainNode.id}
                                                data={domainNode}
                                                level={1}
                                                onSelect={onSelectNode}
                                                selectedId={selectedId}
                                                expandedMode={expandLevel >= 2}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : expandLevel > 0 ? (
                            <CapabilityNode
                                key={tierNode.id}
                                data={tierNode}
                                level={1}
                                onSelect={onSelectNode}
                                selectedId={selectedId}
                                expandedMode={expandLevel >= 2}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CapabilityMap;
