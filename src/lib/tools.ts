export interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;
    parameters: any; // JSON Schema
    execute: (args: any) => Promise<string>;
}

export type ToolCategory = 'Web & Search' | 'File & Document' | 'Data & Database' | 'Coding & Development' | 'Productivity';

export const TOOL_REGISTRY: ToolDefinition[] = [
    // --- Web & Search ---
    {
        id: 'google_search',
        name: 'SerperDevTool (Google Search)',
        description: 'Search the web for real-time information.',
        category: 'Web & Search',
        parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        execute: async ({ query }) => { return `[Mock] Search results for: ${query}`; }
    },
    {
        id: 'website_scrape',
        name: 'ScrapeWebsiteTool',
        description: 'Read the content of a specific website url.',
        category: 'Web & Search',
        parameters: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
        execute: async ({ url }) => { return `[Mock] Scraped content from: ${url}`; }
    },
    {
        id: 'duckduckgo_search',
        name: 'DuckDuckGoSearchRun',
        description: 'Privacy-focused web search.',
        category: 'Web & Search',
        parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        execute: async ({ query }) => { return `[Mock] DDG Results for: ${query}`; }
    },

    // --- File & Document ---
    {
        id: 'read_file',
        name: 'FileReadTool',
        description: 'Read the contents of a local file.',
        category: 'File & Document',
        parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
        execute: async ({ path }) => { return `[Mock] Contents of file: ${path}`; }
    },
    {
        id: 'list_directory',
        name: 'DirectoryReadTool',
        description: 'List files in a directory.',
        category: 'File & Document',
        parameters: { type: 'object', properties: { path: { type: 'string' } } },
        execute: async ({ path }) => { return `[Mock] Files in ${path || '.'}: ['file1.txt', 'notes.md']`; }
    },

    // --- Data & Database ---
    {
        id: 'sql_query',
        name: 'NL2SQLTool',
        description: 'Convert natural language to SQL and query database.',
        category: 'Data & Database',
        parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        execute: async ({ query }) => { return `[Mock] SQL Result for: ${query}`; }
    },

    // --- Coding & Development ---
    {
        id: 'github_search',
        name: 'GithubSearchTool',
        description: 'Search for repositories or code on GitHub.',
        category: 'Coding & Development',
        parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        execute: async ({ query }) => { return `[Mock] GitHub Repos for: ${query}`; }
    },

    // --- Productivity ---
    {
        id: 'zapier_action',
        name: 'ZapierActionTool',
        description: 'Trigger an action in 5000+ apps via Zapier.',
        category: 'Productivity',
        parameters: { type: 'object', properties: { action: { type: 'string' } }, required: ['action'] },
        execute: async ({ action }) => { return `[Mock] Zapier action triggered: ${action}`; }
    },

    // --- Utility ---
    {
        id: 'get_current_time',
        name: 'TimeTool',
        description: 'Get the current server time.',
        category: 'Productivity',
        parameters: { type: 'object', properties: {} },
        execute: async () => { return new Date().toLocaleString(); }
    }
];
