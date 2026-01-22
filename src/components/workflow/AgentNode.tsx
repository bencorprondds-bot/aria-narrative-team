import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { MoreHorizontal, PlayCircle, StopCircle, X, Wrench, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { TOOL_REGISTRY } from '@/lib/tools';

const AgentNode = ({ data, id }: NodeProps) => {
    const isStart = data.role === 'trigger';
    const isEnd = data.isEnd;

    // DnD Hook
    const { setNodeRef, isOver } = useDroppable({
        id: id, // The node's ID is the droppable ID
    });

    const toggleStart = () => {
        data.onUpdate?.(id, { role: isStart ? 'agent' : 'trigger' });
    };

    const toggleEnd = () => {
        data.onUpdate?.(id, { isEnd: !isEnd });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        data.onUpdate?.(id, { initialInput: e.target.value });
    };

    const removeTool = (toolId: string) => {
        const currentTools = data.tools || [];
        const newTools = currentTools.filter((t: string) => t !== toolId);
        data.onUpdate?.(id, { tools: newTools });
    };

    const equippedTools = (data.tools || []).map((toolId: string) =>
        TOOL_REGISTRY.find(t => t.id === toolId)
    ).filter(Boolean); // Filter out any unknown tools

    return (
        <div
            ref={setNodeRef}
            className={`shadow-md rounded-lg bg-white border-2 min-w-[250px] transition-colors
                ${data.color || 'border-gray-200'}
                ${isStart ? 'ring-4 ring-green-400' : ''} 
                ${isEnd ? 'ring-4 ring-red-400' : ''}
                ${isOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
            `}
        >

            {/* Context Actions (Always visible now) */}
            <div className="absolute -top-8 left-0 flex gap-1 bg-white p-1 rounded border shadow-sm z-50">
                <button
                    onClick={toggleStart}
                    className={`p-1 rounded hover:bg-gray-100 ${isStart ? 'text-green-600' : 'text-gray-400'}`}
                    title="Set as Trigger Node"
                >
                    <PlayCircle className="w-4 h-4" />
                </button>
                <button
                    onClick={toggleEnd}
                    className={`p-1 rounded hover:bg-gray-100 ${isEnd ? 'text-red-600' : 'text-gray-400'}`}
                    title="Set as Termination Node"
                >
                    <StopCircle className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg group">
                <div className="font-bold text-gray-700 flex items-center gap-2">
                    {data.label}
                    {isStart && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">START</span>}
                    {isEnd && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded">END</span>}
                </div>
                <button
                    onClick={() => data.onDelete?.(id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-3 text-sm text-gray-500 bg-white rounded-b-lg space-y-3">
                <div className="uppercase text-[10px] font-bold tracking-wider text-gray-300">{data.role}</div>

                {/* Inbox Input Field */}
                {isStart && (
                    <div className="mb-2">
                        <textarea
                            className="w-full text-xs p-2 border border-gray-200 rounded bg-yellow-50 focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 resize-none dark:bg-gray-50 dark:text-gray-900"
                            rows={3}
                            placeholder="Inbox Input..."
                            value={data.initialInput || ''}
                            onChange={handleInputChange}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag on click
                        />
                    </div>
                )}

                {/* Tools Section */}
                <div className="border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mb-2">
                        <Wrench className="w-3 h-3" />
                        <span>Tools ({equippedTools.length})</span>
                    </div>

                    {equippedTools.length > 0 ? (
                        <div className="space-y-1">
                            {equippedTools.map((tool: any) => (
                                <div key={tool.id} className="flex items-center justify-between bg-gray-50 p-1.5 rounded border border-gray-100 group/tool">
                                    <span className="text-xs text-gray-600 truncate max-w-[150px]" title={tool.description}>{tool.name}</span>
                                    <button
                                        onClick={() => removeTool(tool.id)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover/tool:opacity-100 transition-opacity"
                                        title="Remove Tool"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-[10px] text-gray-300 italic text-center py-1 border-2 border-dashed border-gray-100 rounded">
                            Drag tools here
                        </div>
                    )}
                </div>

                {/* Visual Handles */}
                <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />
                <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
            </div>
        </div>
    );
};

export default memo(AgentNode);
