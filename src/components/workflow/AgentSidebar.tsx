import { AGENT_REGISTRY } from "@/lib/agents";
import { Users, GripVertical } from "lucide-react";

export function AgentSidebar() {
    const onDragStart = (event: React.DragEvent, agentId: string) => {
        event.dataTransfer.setData('application/reactflow', agentId);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
                <h2 className="font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Agent Library
                </h2>
                <p className="text-xs text-gray-500 mt-1">Drag agents to the canvas</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {AGENT_REGISTRY.map((agent) => (
                    <div
                        key={agent.id}
                        className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${agent.color}`}
                        onDragStart={(event) => onDragStart(event, agent.id)}
                        draggable
                    >
                        <div className="flex items-start justify-between">
                            <span className="font-medium text-sm">{agent.name}</span>
                            <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-snug">{agent.description}</p>
                    </div>
                ))}
            </div>
        </aside>
    );
}
