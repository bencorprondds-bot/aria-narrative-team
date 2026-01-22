export type AgentRole = 'editorial' | 'specialist' | 'dev' | 'marketing';

export interface Agent {
    id: string;
    name: string;
    role: AgentRole;
    description: string;
    color: string;
}

export const AGENT_REGISTRY: Agent[] = [
    // Editorial Team
    { id: 'atlas', name: 'Atlas (Continuity)', role: 'editorial', description: 'Checks timeline and world consistency.', color: 'bg-blue-100 border-blue-500' },
    { id: 'developmental', name: 'Dev Editor', role: 'editorial', description: 'Focuses on structure, pacing, and stakes.', color: 'bg-green-100 border-green-500' },
    { id: 'character', name: 'Character Integrity', role: 'editorial', description: 'Ensures voice and motivation consistency.', color: 'bg-yellow-100 border-yellow-500' },
    { id: 'viktor', name: 'Viktor Specialist', role: 'specialist', description: 'Expert on AI character phases.', color: 'bg-purple-100 border-purple-500' },
    { id: 'line_edit', name: 'Line & Sensory', role: 'editorial', description: 'Polishes prose and sensory details.', color: 'bg-pink-100 border-pink-500' },
    { id: 'marketing_lead', name: 'Marketing Lead', role: 'marketing', description: 'Generates blurbs and social copy.', color: 'bg-orange-100 border-orange-500' },
    { id: 'code_architect', name: 'Code Architect', role: 'dev', description: 'Plans software architecture.', color: 'bg-slate-100 border-slate-500' },
];
