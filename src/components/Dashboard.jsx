import React from 'react';
import { Layers, Cuboid, Network, Activity, BarChart2, Copy, Share2, AlertCircle, ShieldAlert } from 'lucide-react';

const Dashboard = ({ data }) => {
    if (!data || !data.children) return null;

    const uniqueTiers = new Set();
    const uniqueDomains = new Set();
    const uniqueCapabilities = new Set();
    const uniqueSubCapabilities = new Set();

    // Recurse through tree to count unique entities based on raw data columns if available
    const analyzeData = (nodes) => {
        nodes.forEach(node => {
            if (node._raw) {
                if (node._raw['Tier'] && node._raw['Tier'].trim()) uniqueTiers.add(node._raw['Tier'].trim());
                if (node._raw['Domain'] && node._raw['Domain'].trim()) uniqueDomains.add(node._raw['Domain'].trim());
                if (node._raw['Capability'] && node._raw['Capability'].trim()) uniqueCapabilities.add(node._raw['Capability'].trim());
                if (node._raw['Sub-Capability'] && node._raw['Sub-Capability'].trim()) uniqueSubCapabilities.add(node._raw['Sub-Capability'].trim());

                // Fallback for nodes that might not have these specific columns
                if (!node._raw['Tier'] && node.level === 0) uniqueTiers.add(node.name);
                if (!node._raw['Domain'] && node.level === 1 && !node._raw['Tier']) uniqueDomains.add(node.name);
            }
            if (node.children) analyzeData(node.children);
        });
    }

    analyzeData(data.children);

    const totalTiers = uniqueTiers.size || data.children.filter(n => n.level === 0).length;
    const totalDomains = uniqueDomains.size;
    const totalCapabilities = uniqueCapabilities.size;
    const totalSubCapabilities = uniqueSubCapabilities.size;

    // Collect a breakdown per Tier
    const tierBreakdown = data.children.filter(n => n.level === 0).map(tier => {
        const tierDomains = new Set();
        const tierCaps = new Set();
        const tierSubCaps = new Set();

        const countCh = (n) => {
            if (n._raw) {
                if (n._raw['Domain'] && n._raw['Domain'].trim()) tierDomains.add(n._raw['Domain'].trim());
                if (n._raw['Capability'] && n._raw['Capability'].trim()) tierCaps.add(n._raw['Capability'].trim());
                if (n._raw['Sub-Capability'] && n._raw['Sub-Capability'].trim()) tierSubCaps.add(n._raw['Sub-Capability'].trim());
            } else if (n.level === 1) {
                tierDomains.add(n.name);
            }
            if (n.children) n.children.forEach(countCh);
        }
        if (tier.children) tier.children.forEach(countCh);

        return {
            name: tier.name,
            domains: tierDomains.size > 0 ? tierDomains.size : (tier.children ? tier.children.length : 0),
            capabilities: tierCaps.size,
            subCapabilities: tierSubCaps.size
        };
    });

    const allCapabilities = [];
    const gatherCaps = (nodes) => {
        nodes.forEach(n => {
            if (n.level === 2) allCapabilities.push(n);
            if (n.children) gatherCaps(n.children);
        });
    };
    gatherCaps(data.children);

    let noSubCapsCount = 0;
    allCapabilities.forEach(c => {
        if (!c.children || c.children.length === 0) noSubCapsCount++;
    });

    const capNameCounts = {};
    allCapabilities.forEach(c => {
        const name = (c.name || '').trim().toLowerCase();
        capNameCounts[name] = (capNameCounts[name] || 0) + 1;
    });
    const duplicatedCapsCount = allCapabilities.filter(c => capNameCounts[(c.name || '').trim().toLowerCase()] > 1).length;

    const subCapNameParents = {};
    allCapabilities.forEach(c => {
        if (c.children) {
            c.children.forEach(sc => {
                const scName = (sc.name || '').trim().toLowerCase();
                if (!subCapNameParents[scName]) subCapNameParents[scName] = new Set();
                subCapNameParents[scName].add((c.name || '').trim().toLowerCase());
            });
        }
    });
    
    const overlappingSubCapNames = new Set(
        Object.keys(subCapNameParents).filter(name => subCapNameParents[name].size > 1)
    );
    
    const overlappingCapsCount = allCapabilities.filter(c => {
        if (!c.children) return false;
        return c.children.some(sc => overlappingSubCapNames.has((sc.name || '').trim().toLowerCase()));
    }).length;

    const conventionViolationsCount = allCapabilities.filter(c => {
        const name = (c.name || '').trim();
        // Convention Violations: lower-case starts, slashes, ampersands, parentheses, or trailing punctuation
        return /[/&()]|[.,;:]$/.test(name) || /^[a-z]/.test(name);
    }).length;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header glass-panel">
                <h1 className="gradient-text">Model Dashboard</h1>
                <p className="subtitle">High-level metrics and model composition</p>
            </div>

            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="var(--accent-blue)" /> Model Overview
            </h3>
            <div className="metrics-grid dashboard-top-metrics" style={{ marginBottom: '2.5rem' }}>
                <div className="glass-panel stat-card">
                    <div className="stat-icon"><Layers size={24} color="var(--accent-purple)" /></div>
                    <div className="stat-content">
                        <h3>Tiers</h3>
                        <div className="stat-value">{totalTiers}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon"><Cuboid size={24} color="var(--accent-blue)" /></div>
                    <div className="stat-content">
                        <h3>Domains</h3>
                        <div className="stat-value">{totalDomains}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon"><Network size={24} color="var(--accent-green)" /></div>
                    <div className="stat-content">
                        <h3>Capabilities</h3>
                        <div className="stat-value">{totalCapabilities}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon"><Activity size={24} color="var(--accent-orange)" /></div>
                    <div className="stat-content">
                        <h3>Sub-Capabilities</h3>
                        <div className="stat-value">{totalSubCapabilities}</div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="var(--accent-orange)" /> Quality Insights
            </h3>
            <div className="metrics-grid dashboard-top-metrics">
                <div className="glass-panel stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}><Copy size={24} color="var(--accent-red)" /></div>
                    <div className="stat-content">
                        <h3>Duplications</h3>
                        <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{duplicatedCapsCount}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}><Share2 size={24} color="var(--accent-orange)" /></div>
                    <div className="stat-content">
                        <h3>Overlaps</h3>
                        <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{overlappingCapsCount}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}><AlertCircle size={24} color="#9ca3af" /></div>
                    <div className="stat-content">
                        <h3>No Sub-Caps</h3>
                        <div className="stat-value" style={{ color: '#9ca3af' }}>{noSubCapsCount}</div>
                    </div>
                </div>
                <div className="glass-panel stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}><ShieldAlert size={24} color="var(--accent-purple)" /></div>
                    <div className="stat-content">
                        <h3>Principles and Conventions Violation</h3>
                        <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{conventionViolationsCount}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts glass-panel" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart2 size={18} color="var(--accent-orange)" /> Tier Breakdown</h3>
                <div className="tier-breakdown-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tierBreakdown.map((t, idx) => (
                        <div key={idx} className="tier-stat-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1.5fr) 1fr 1fr 1fr', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{t.name}</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '4px 8px', borderRadius: '4px', color: '#93c5fd' }}>{t.domains} Domains</div>
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '4px 8px', borderRadius: '4px', color: '#6ee7b7' }}>{t.capabilities} Capabilities</div>
                            </div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '4px 8px', borderRadius: '4px', color: '#fcd34d' }}>{t.subCapabilities} Sub-Cap.</div>
                            </div>
                        </div>
                    ))}
                    {tierBreakdown.length === 0 && <div style={{ opacity: 0.5 }}>No tiers structured in this model.</div>}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
