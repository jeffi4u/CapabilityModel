import React from 'react';
import { Activity, ArrowRight, X } from 'lucide-react';

const DetailsPanel = ({ data, onClose }) => {
    if (!data) {
        return (
            <aside className="details-panel glass-panel empty-state" style={{ position: 'relative' }}>
                <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16 }}>
                    <X size={20} />
                </button>
                <p>Select a capability from the map to view its details, attributes, and metrics here.</p>
            </aside>
        );
    }

    return (
        <aside className="details-panel glass-panel">
            <div className="panel-header">
                <div>
                    <span className="level-badge">Level {data?.level !== undefined ? data.level : '-'} Capability</span>
                    <h2>{data?.name}</h2>
                </div>
                <button className="close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            <div className="panel-content">
                <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <h3>Overview</h3>
                    <p>{data?.description || "Detailed description and strategic context for this capability will be displayed here."}</p>
                </section>

                <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <h3><Activity size={16} /> Attributes & Metrics</h3>

                    {(() => {
                        const rawData = data?._raw || {};
                        const maturityScoreRaw = rawData['Maturity Score'] || rawData['Maturity'] || rawData['Score'];
                        const maturityScore = maturityScoreRaw !== undefined ? parseInt(maturityScoreRaw, 10) : undefined;

                        const hiddenKeys = ['Display ID', 'ID', 'Id', 'id', 'Capability ID', 'Sub-Capability', 'Capability', 'Domain', 'Tier', 'Name', 'name', 'Capability Name', 'Description', 'description', 'Desc', 'Level', 'level', 'Maturity Score', 'Maturity', 'Score'];
                        const otherMetrics = Object.entries(rawData).filter(([key]) => !hiddenKeys.includes(key));

                        return (
                            <>
                                {!isNaN(maturityScore) && (
                                    <div className="metric-card" style={{ padding: '16px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#93c5fd', fontWeight: 500 }}>Maturity Score</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{maturityScore} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ 5</span></span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', height: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(level => {
                                                const isActive = level <= maturityScore;
                                                // Color gradient based on level (red to green to blue etc)
                                                // Or just use the global accent-blue
                                                return (
                                                    <div key={level} style={{
                                                        flex: 1,
                                                        borderRadius: '4px',
                                                        background: isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                                                        boxShadow: isActive ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none',
                                                        transition: 'all 0.3s'
                                                    }} />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="metrics-grid" style={{ gridTemplateColumns: '1fr', gap: '10px' }}>
                                    {otherMetrics.map(([key, value]) => (
                                        <div key={key} className="metric-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{key}</div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {value}
                                            </div>
                                        </div>
                                    ))}

                                    {isNaN(maturityScore) && otherMetrics.length === 0 && (
                                        <div className="metric-card" style={{ padding: '16px', display: 'flex', justifyContent: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
                                            <div style={{ fontSize: '0.875rem' }}>No attributes available</div>
                                        </div>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </section>

                {data?.children && data.children.length > 0 && (
                    <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <h3>Sub-Capabilities</h3>
                        <ul className="sub-list">
                            {data.children.map(child => (
                                <li key={child.id}>
                                    <span>{child.name}</span>
                                    <ArrowRight size={14} className="arrow-icon" />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </aside>
    );
};

export default DetailsPanel;
