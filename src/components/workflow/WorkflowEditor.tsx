"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    Connection,
    Edge,
    MarkerType,
    Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentSidebar } from './AgentSidebar';
import AgentNode from './AgentNode';
import { AGENT_REGISTRY } from '@/lib/agents';

const nodeTypes = {
    agent: AgentNode,
};

const DEFAULT_NODES = [
    {
        id: '1',
        type: 'agent',
        position: { x: 250, y: 5 },
        data: { label: 'Inbox', role: 'trigger', color: 'border-gray-400 bg-gray-50' }
    },
];

interface WorkflowEditorProps {
    initialData?: { nodes: Node[], edges: Edge[] };
    onSaveRef?: React.MutableRefObject<(() => { nodes: Node[], edges: Edge[] }) | undefined>;
}

export default function WorkflowEditor({ initialData, onSaveRef }: WorkflowEditorProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || DEFAULT_NODES);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    // Expose state to parent for saving
    useEffect(() => {
        if (onSaveRef) {
            onSaveRef.current = () => ({
                nodes,
                edges
            });
        }
    }, [nodes, edges, onSaveRef]);

    // Helper to delete node (passed to custom node)
    const onDeleteNode = useCallback((id: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    }, [setNodes, setEdges]);

    const onUpdateNode = useCallback((id: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, ...newData } };
            }
            return node;
        }));
    }, [setNodes]);

    // Re-attach functions
    useEffect(() => {
        setNodes((nds) => nds.map(n => ({
            ...n,
            data: {
                ...n.data,
                onDelete: onDeleteNode,
                onUpdate: onUpdateNode
            }
        })));
    }, [onDeleteNode, onUpdateNode, setNodes]);


    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: true,
            style: { stroke: '#b1b1b7', strokeWidth: 2 }
        }, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const agentId = event.dataTransfer.getData('application/reactflow');
            const agent = AGENT_REGISTRY.find(a => a.id === agentId);

            if (typeof agentId === 'undefined' || !agent || !reactFlowInstance) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: `${agentId}_${Date.now()}`,
                type: 'agent',
                position,
                data: {
                    label: agent.name,
                    role: agent.role,
                    color: agent.color.split(' ')[1], // extract border class
                    onDelete: onDeleteNode,
                    onUpdate: onUpdateNode
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, onDeleteNode, setNodes],
    );

    return (
        <div className="flex h-[calc(100vh-64px)]">
            <ReactFlowProvider>
                <AgentSidebar />
                <div className="flex-1 h-full" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls />
                        <Background color="#aaa" gap={16} />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </div>
    );
}
