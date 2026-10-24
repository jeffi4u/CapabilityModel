import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronRight } from 'lucide-react';

const CapabilityNode = ({ data, level = 1, onSelect, selectedId, expandedMode }) => {
    const isSelected = selectedId === data.id;
    const hasChildren = data.children && data.children.length > 0;

    // Manage local expanded state
    const [isExpanded, setIsExpanded] = useState(expandedMode);

    useEffect(() => {
        setIsExpanded(expandedMode);
    }, [expandedMode]);

    const handleNodeClick = (e) => {
        e.stopPropagation();
        onSelect(data);
        if (hasChildren && level === 1) { // Click domain expands it
            setIsExpanded(!isExpanded);
        }
    };

    const handleToggleCollapse = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`capability-node level-${level} ${isSelected ? 'selected' : ''}`}
            onClick={handleNodeClick}
        >
            <div className="node-header" style={{ cursor: level === 1 && hasChildren ? 'pointer' : 'default' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {hasChildren && (
                        <button
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                            onClick={handleToggleCollapse}
                        >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                    )}
                    <h3>{data.name}</h3>
                </div>
                {level === 1 && (
                    <button className="info-btn" title="View Details" onClick={(e) => { e.stopPropagation(); onSelect(data); }}>
                        <Info size={16} />
                    </button>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="node-children">
                    {data.children.map(child => (
                        <CapabilityNode
                            key={child.id}
                            data={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                            expandedMode={expandedMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CapabilityNode;
