import React from 'react';

const ModelOnAPage = ({ data }) => {
    if (!data || !data.children) return null;

    // Extract Tiers (Level 0 nodes)
    const tiers = data.children.filter(n => n.level === 0 || (n.name && n.name.toLowerCase().includes('tier')));
    const fallbackTiers = tiers.length > 0 ? tiers : [{
        id: 'no-tier',
        name: 'Capability Model',
        children: data.children
    }];

    return (
        <div className="moap-container fadeIn">
            <div className="moap-slide glass-panel">
                <div className="moap-tiers-grid">
                    {fallbackTiers.map(tier => (
                        <div key={tier.id} className="moap-tier-row">
                            <div className="moap-tier-header">
                                {tier.name}
                            </div>
                            <div className="moap-domains-list">
                                {tier.children && tier.children.map(domain => (
                                    <div key={domain.id} className="moap-domain-card">
                                        {domain.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModelOnAPage;
