// Temporary mock data reflecting a typical Level 1 -> Level 2 -> Level 3 nested capability model
export const mockData = {
    name: "Business Capability Model",
    id: "root",
    children: [
        {
            id: "C1",
            name: "Customer Experience",
            description: "Managing all aspects of the customer journey.",
            level: 1,
            children: [
                {
                    id: "C1.1",
                    name: "Marketing",
                    level: 2,
                    children: [
                        { id: "C1.1.1", name: "Campaign Management", level: 3 },
                        { id: "C1.1.2", name: "Brand Management", level: 3 }
                    ]
                },
                {
                    id: "C1.2",
                    name: "Sales",
                    level: 2,
                    children: [
                        { id: "C1.2.1", name: "Lead Generation", level: 3 },
                        { id: "C1.2.2", name: "Account Management", level: 3 }
                    ]
                }
            ]
        },
        {
            id: "C2",
            name: "Operations",
            description: "Core business operations and supply chain.",
            level: 1,
            children: [
                {
                    id: "C2.1",
                    name: "Supply Chain",
                    level: 2,
                    children: [
                        { id: "C2.1.1", name: "Inventory Management", level: 3 },
                        { id: "C2.1.2", name: "Logistics", level: 3 }
                    ]
                },
                {
                    id: "C2.2",
                    name: "Manufacturing",
                    level: 2,
                    children: [
                        { id: "C2.2.1", name: "Production Planning", level: 3 }
                    ]
                }
            ]
        },
        {
            id: "C3",
            name: "Corporate Support",
            level: 1,
            children: [
                {
                    id: "C3.1",
                    name: "Human Resources",
                    level: 2,
                    children: [
                        { id: "C3.1.1", name: "Talent Acquisition", level: 3 },
                        { id: "C3.1.2", name: "Payroll", level: 3 }
                    ]
                },
                {
                    id: "C3.2",
                    name: "Finance",
                    level: 2,
                    children: [
                        { id: "C3.2.1", name: "Financial Planning", level: 3 },
                        { id: "C3.2.2", name: "Accounting", level: 3 }
                    ]
                }
            ]
        }
    ]
};

// Helper to add fake metrics to mock data for demonstration
const enrichMockData = (node) => {
    node._raw = {
        "Maturity Score": Math.floor(Math.random() * 5) + 1,
        "Strategic Value": ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
        "Completeness (%)": Math.floor(Math.random() * 50) + 50
    };
    if (node.children) {
        node.children.forEach(enrichMockData);
    }
    return node;
};

enrichMockData(mockData);

import * as XLSX from 'xlsx';

export const parseExcelData = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Assume first sheet is the capability model
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const rawData = XLSX.utils.sheet_to_json(worksheet);

                if (!rawData || rawData.length === 0) {
                    reject(new Error("Excel file is empty"));
                    return;
                }

                const root = {
                    id: 'root',
                    name: file.name.replace(/\.[^/.]+$/, ""), // File name without extension
                    children: []
                };

                const nodeMap = {};

                // First pass: create all nodes
                rawData.forEach(row => {
                    // Try to handle different common column naming conventions including the new screenshot format
                    const id = row['Display ID'] || row.ID || row.Id || row.id || row['Capability ID'] || String(Math.random());

                    // Fallbacks for the name, going from most specific to least specific based on standard taxonomy
                    const name = row['Sub-Capability'] || row['Capability'] || row['Domain'] || row['Tier'] || row.Name || row.name || row['Capability Name'] || 'Unknown';

                    const description = row.Description || row.description || row.Desc || '';

                    let levelStr = row.Level || row.level || '';
                    // Clean level if it has an "L" prefix (e.g. "L3" -> "3")
                    if (typeof levelStr === 'string' && levelStr.toUpperCase().startsWith('L')) {
                        levelStr = levelStr.substring(1);
                    }

                    // Guess level from ID if not explicitly provided (e.g. C1.1 is level 2)
                    let level = parseInt(levelStr, 10);
                    if (isNaN(level)) {
                        level = String(id).split('.').length;
                    }

                    const node = {
                        id: String(id),
                        name: String(name),
                        description: String(description),
                        level: level,
                        children: [],
                        _raw: row // Store raw data for metrics panel later
                    };

                    nodeMap[node.id] = node;
                });

                // Second pass: build tree based on ID structure (e.g., parent of C1.1 is C1)
                Object.values(nodeMap).forEach(node => {
                    const parts = node.id.split('.');
                    if (parts.length > 1) {
                        // Find parent id by removing the last segment part
                        parts.pop();
                        const parentId = parts.join('.');

                        if (nodeMap[parentId]) {
                            nodeMap[parentId].children.push(node);
                        } else {
                            // Parent missing, attach to root
                            root.children.push(node);
                        }
                    } else {
                        // Top level nodes attach to root
                        root.children.push(node);
                    }
                });

                // Third pass: Group top-level nodes by Tier
                let hasTiers = false;
                const tiersMap = {};
                const unTieredChildren = [];

                root.children.forEach(node => {
                    const rawTier = node._raw && node._raw.Tier;
                    if (rawTier) {
                        hasTiers = true;
                        if (!tiersMap[rawTier]) {
                            tiersMap[rawTier] = {
                                id: `Tier-${rawTier}`,
                                name: String(rawTier),
                                description: `${rawTier} Level`,
                                level: 0,
                                children: [],
                                _raw: { Tier: rawTier }
                            };
                        }
                        tiersMap[rawTier].children.push(node);
                    } else {
                        unTieredChildren.push(node);
                    }
                });

                if (hasTiers) {
                    const sortedTiers = Object.values(tiersMap).sort((a, b) => {
                        const nameA = (a.name || '').toLowerCase();
                        const nameB = (b.name || '').toLowerCase();

                        const getWeight = (name) => {
                            if (name.includes('business') || name.includes('consumable')) return 1;
                            if (name.includes('enterprise')) return 2;
                            if (name.includes('enabling') || name.includes('enable')) return 3;
                            return 4; // default / others at bottom
                        };

                        return getWeight(nameA) - getWeight(nameB);
                    });

                    root.children = sortedTiers.concat(unTieredChildren);
                }

                // Fallback: just return it as a flat list under root
                if (root.children.length === 0 && Object.keys(nodeMap).length > 0) {
                    console.warn("Could not infer hierarchy from IDs. Returning flat list.");
                    root.children = Object.values(nodeMap);
                }

                resolve(root);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const filterData = (data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();

    const _filter = (node) => {
        // Check if current node name matches exactly
        const nodeMatches = node.name && node.name.toLowerCase().includes(lowerQuery);

        if (nodeMatches) {
            // Include node and all its children untouched
            return { ...node };
        }

        // Check if any children match
        if (node.children && node.children.length > 0) {
            const childrenMatches = [];
            for (const child of node.children) {
                const filteredChild = _filter(child);
                if (filteredChild) {
                    childrenMatches.push(filteredChild);
                }
            }
            if (childrenMatches.length > 0) {
                // Return node with only matching children
                return { ...node, children: childrenMatches };
            }
        }

        // No match here or in children
        return null;
    };

    // Keep root node and filter its children
    const filteredRoot = { ...data, children: [] };
    if (data.children) {
        for (const child of data.children) {
            const filteredChild = _filter(child);
            if (filteredChild) {
                filteredRoot.children.push(filteredChild);
            }
        }
    }
    return filteredRoot;
};
