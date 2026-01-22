"use client";

import { useDraggable } from '@dnd-kit/core';
import { TOOL_REGISTRY, ToolCategory } from '@/lib/tools';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, Search, FileText, Database, Code, Zap } from 'lucide-react';

export function ToolSidebar() {
    // Group tools by category
    const categories: Record<ToolCategory, typeof TOOL_REGISTRY> = {
        'Web & Search': [],
        'File & Document': [],
        'Data & Database': [],
        'Coding & Development': [],
        'Productivity': []
    };

    TOOL_REGISTRY.forEach(tool => {
        if (categories[tool.category]) {
            categories[tool.category].push(tool);
        }
    });

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Toolbox
                </h2>
                <p className="text-xs text-gray-500 mt-1">Drag tools onto agents</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {Object.entries(categories).map(([category, tools]) => (
                    <ToolCategoryGroup key={category} category={category as ToolCategory} tools={tools} />
                ))}
            </div>
        </div>
    );
}

function ToolCategoryGroup({ category, tools }: { category: ToolCategory, tools: typeof TOOL_REGISTRY }) {
    const [isOpen, setIsOpen] = useState(false); // Default closed as requested? Or open? "stay open for me to drag" usually implies click-to-open.

    const Icon = getCategoryIcon(category);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
                <div className="flex items-center gap-2 font-medium text-sm text-gray-700 dark:text-gray-200">
                    <Icon className="w-4 h-4 text-gray-400" />
                    {category}
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {isOpen && (
                <div className="p-2 space-y-2 bg-white dark:bg-gray-800">
                    {tools.map(tool => (
                        <DraggableTool key={tool.id} tool={tool} />
                    ))}
                    {tools.length === 0 && (
                        <div className="text-xs text-center text-gray-400 italic py-2">No tools available</div>
                    )}
                </div>
            )}
        </div>
    );
}

function DraggableTool({ tool }: { tool: any }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `tool-${tool.id}`,
        data: { toolId: tool.id }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 9999, // Ensure it floats above everything
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing text-sm"
        >
            <div className="font-medium text-gray-800 dark:text-gray-200">{tool.name}</div>
            <div className="text-[10px] text-gray-500 truncate">{tool.description}</div>
        </div>
    );
}

function getCategoryIcon(category: ToolCategory) {
    switch (category) {
        case 'Web & Search': return Search;
        case 'File & Document': return FileText;
        case 'Data & Database': return Database;
        case 'Coding & Development': return Code;
        case 'Productivity': return Zap;
        default: return Wrench;
    }
}
