"use client";

import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";

interface RunInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRun: (input: string) => void;
    isRunning: boolean;
    initialValue?: string;
}

export function RunInputModal({ isOpen, onClose, onRun, isRunning, initialValue }: RunInputModalProps) {
    const [input, setInput] = useState(initialValue || "Start the review process for Chapter 1.");

    useEffect(() => {
        if (isOpen && initialValue) {
            setInput(initialValue);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRun(input);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Run Workflow</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500"
                        disabled={isRunning}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Initial Input
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={5}
                            placeholder="Enter the initial text or instructions for the workflow..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            disabled={isRunning}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            This text will be passed to the first agent in your workflow.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRunning}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isRunning || !input.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            {isRunning ? "Running..." : "Run"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
