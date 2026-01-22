"use client";

import { useState, useEffect } from "react";
import { AGENT_REGISTRY, Agent } from "@/lib/agents";
import { Send, User, Bot, Save } from "lucide-react";

export default function ChatInterface() {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENT_REGISTRY[0]);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(selectedAgent.description);

    // Fetch prompt when agent changes
    useEffect(() => {
        setLoading(true);
        fetch(`/api/prompts?agentId=${selectedAgent.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.prompt) setSystemPrompt(data.prompt);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setSystemPrompt(selectedAgent.description); // Fallback
                setLoading(false);
            });
    }, [selectedAgent.id]);

    const handleSavePrompt = async () => {
        setLoading(true);
        try {
            await fetch('/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: selectedAgent.id, content: systemPrompt })
            });
            alert("System Persona saved to Drive!");
        } catch (e) {
            console.error(e);
            alert("Failed to save persona.");
        }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    systemInstruction: `You are ${selectedAgent.name}. Role: ${selectedAgent.role}. Context: ${systemPrompt}`
                })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Sidebar: Agent Selection */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-100 font-bold text-gray-700">Interview Agent</div>
                {AGENT_REGISTRY.map(agent => (
                    <button
                        key={agent.id}
                        onClick={() => { setSelectedAgent(agent); setMessages([]); setSystemPrompt(agent.description); }}
                        className={`w-full text-left p-3 text-sm hover:bg-gray-50 ${selectedAgent.id === agent.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.role}</div>
                    </button>
                ))}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header / Prompt Editor */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-600" />
                            Wait room: {selectedAgent.name}
                        </h2>
                        <button
                            onClick={handleSavePrompt}
                            disabled={loading}
                            className="text-xs flex items-center gap-1 bg-gray-100 hover:bg-green-100 hover:text-green-700 px-3 py-1 rounded border border-gray-200 transition-colors"
                        >
                            <Save className="w-3 h-3" /> Save Persona
                        </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">System Persona (Editable)</label>
                        <textarea
                            className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
                            rows={3}
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                        />
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 shadow-sm'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && <div className="text-xs text-gray-400 text-center animate-pulse">Thinking...</div>}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Ask ${selectedAgent.name} something...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
