import React from 'react';
import { X, ChevronRight, ChevronDown, Terminal, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ExecutionLog {
    nodeId: string;
    agentName: string;
    input: string;
    output: string;
    timestamp: number;
}

interface ExecutionLogPanelProps {
    logs: ExecutionLog[];
    isOpen: boolean;
    onClose: () => void;
}

export function ExecutionLogPanel({ logs, isOpen, onClose }: ExecutionLogPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-bold text-gray-800 dark:text-gray-100">Execution Log</h2>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                        {logs.length} Steps
                    </span>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500 dark:hover:bg-gray-700 dark:text-gray-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900">
                {logs.length === 0 && (
                    <div className="text-center text-gray-400 mt-10">
                        <p>No execution logs yet.</p>
                        <p className="text-xs">Run a workflow to see results.</p>
                    </div>
                )}

                {logs.map((log, index) => (
                    <LogItem key={index} log={log} index={index} />
                ))}
            </div>
        </div>
    );
}

function LogItem({ log, index }: { log: ExecutionLog, index: number }) {
    const [expanded, setExpanded] = React.useState(true);

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
            {/* Step Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 text-left border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            >
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{log.agentName}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
                {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Content */}
            {expanded && (
                <div className="p-4 text-sm space-y-3 dark:text-gray-300">
                    {/* Output */}
                    <div>
                        <div className="text-xs font-bold text-green-600 uppercase mb-1 dark:text-green-400">Output</div>
                        <div className="bg-white p-3 rounded border border-gray-100 leading-relaxed dark:bg-gray-900 dark:border-gray-700 overflow-x-auto prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>
                                {log.output}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Input */}
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase mb-1">Input Context</div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-xs text-gray-500 whitespace-pre-wrap truncate max-h-20 hover:max-h-96 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                            {log.input}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
