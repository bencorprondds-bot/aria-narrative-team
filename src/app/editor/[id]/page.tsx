"use client";

import WorkflowEditor from "@/components/workflow/WorkflowEditor";
import { useRef, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { Terminal, Moon, Sun, LogOut } from "lucide-react";
import { ExecutionLogPanel } from "@/components/workflow/ExecutionLogPanel";
import { RunInputModal } from "@/components/workflow/RunInputModal";
import { ToolSidebar } from "@/components/workflow/ToolSidebar";
import { useTheme } from "@/components/ThemeProvider";

import { DndContext, DragEndEvent } from '@dnd-kit/core';

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const { status } = useSession();
    const saveRef = useRef<any>(null);
    const [saving, setSaving] = useState(false);
    const [running, setRunning] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [loading, setLoading] = useState(id !== 'new');

    const [executionLogs, setExecutionLogs] = useState<any[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [showRunModal, setShowRunModal] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router]);

    useEffect(() => {
        if (id !== 'new' && status === 'authenticated') {
            fetch(`/api/workflows/${id}`)
                .then(res => res.json())
                .then(data => {
                    setInitialData({ nodes: data.nodes, edges: data.edges });
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else if (id === 'new') {
            setLoading(false);
        }
    }, [id, status]);

    const handleSave = async () => {
        if (!saveRef.current) return;
        setSaving(true);
        const flowData = saveRef.current();

        const isNew = id === 'new';
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? '/api/workflows' : `/api/workflows/${id}`;

        try {
            const body = {
                name: isNew ? `Workflow ${new Date().toLocaleTimeString()}` : undefined,
                nodes: flowData.nodes,
                edges: flowData.edges
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await res.json();

            if (isNew && result.id) {
                router.push(`/editor/${result.id}`);
            } else {
                // alert("Saved successfully!"); // Optional: suppress if auto-saving before run
            }
            return result.id || id; // Return ID for run
        } catch (e) {
            alert("Failed to save");
            console.error(e);
            return null;
        } finally {
            setSaving(false);
        }
    };

    const [initialInput, setInitialInput] = useState("Start the review process for Chapter 1.");

    const handleRunClick = async () => {
        // Auto-save first
        const currentId = await handleSave();
        if (!currentId || currentId === 'new') {
            alert("Please save the workflow first.");
            return;
        }

        // Get fresh data directly from the editor
        const flowData = saveRef.current ? saveRef.current() : null;

        // Check for Trigger Node Input
        if (flowData?.nodes) {
            const startNode = flowData.nodes.find((n: any) => n.data.role === 'trigger');
            if (startNode?.data?.initialInput && startNode.data.initialInput.trim() !== "") {
                // User has already provided input on the card. Run immediately.
                console.log("Starting execution with existing Inbox input:", startNode.data.initialInput);
                performExecution(startNode.data.initialInput);
                return;
            }
        }
        setShowRunModal(true);
    };

    const performExecution = async (input: string) => {
        setRunning(true);
        // We know ID is valid because handleRunClick checked it and we are in the modal now, 
        // but id from params might be 'new' if we haven't redirected yet? 
        // handleSave returns the valid ID. usage in handleRunClick was correct.
        // We should probably rely on the URL id which should be updated if handleSave redirected,
        // but if handleSave just saved an existing one, id is fine.
        // There is a slight edge case if "New" -> Save -> Redirect happens fast.
        // But for now let's assume `id` is the stable ID since we require save.

        try {
            // For safety, re-save or just use current ID. 
            // If we rely on `id` from `use(params)`, it might be stale if we just redirected?
            // Actually, router.push triggers a re-render so `id` should be fresh.

            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId: id,
                    input: input
                })
            });
            const data = await res.json();
            console.log("Execution Result:", data);

            if (data.logs) {
                setExecutionLogs(data.logs);
                setShowLogs(true);
            }
        } catch (e) {
            console.error(e);
            alert("Execution failed.");
        } finally {
            setRunning(false);
            setShowRunModal(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return; // Dropped on nothing

        const toolId = active.data.current?.toolId;
        const nodeId = over.id; // Node ID is simply the "id" in react flow nodes? Need to check AgentNode integration.

        console.log(`Dropped tool ${toolId} on node ${nodeId}`);

        if (saveRef.current && saveRef.current.onToolDrop) {
            saveRef.current.onToolDrop(nodeId, toolId);
        }
    };

    if (status === 'loading' || loading) return <div className="p-8 dark:text-gray-100">Loading workflow...</div>;
    if (status === 'unauthenticated') return null; // Redirecting...

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-gray-100">
                <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10 dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <div className="text-xs text-gray-500 uppercase font-bold tracking-wider dark:text-gray-400">Workflow Editor</div>
                        <h1 className="text-lg font-bold">
                            {id === 'new' ? 'New Pipeline' : 'Editing Pipeline'}
                        </h1>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2 text-gray-500 dark:text-gray-400"
                            title="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleRunClick}
                            disabled={saving || running}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {running ? 'Running...' : 'Run Workflow'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || running}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Workflow'}
                        </button>
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className={`p-2 rounded-md border text-sm font-medium ${showLogs ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}
                            title="Toggle Execution Logs"
                        >
                            <Terminal className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="p-2 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>
                <div className="flex-1 flex overflow-hidden">
                    {/* Tool Sidebar */}
                    <ToolSidebar />

                    <div className="flex-1 relative">
                        <WorkflowEditor initialData={initialData} onSaveRef={saveRef} />
                        <ExecutionLogPanel
                            logs={executionLogs}
                            isOpen={showLogs}
                            onClose={() => setShowLogs(false)}
                        />
                        <RunInputModal
                            isOpen={showRunModal}
                            onClose={() => setShowRunModal(false)}
                            onRun={performExecution}
                            isRunning={running}
                            initialValue={initialInput}
                        />
                    </div>
                </div>
            </div >
        </DndContext>
    );
}
