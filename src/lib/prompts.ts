import { driveClient } from './drive';
import { AGENT_REGISTRY } from './agents';

export class PromptService {
    private async getPromptsFolderId() {
        const root = await driveClient.findFolder('Life with AI');
        if (!root?.id) throw new Error("Root folder not found");

        const system = await driveClient.findFolder('00_System', root.id);
        if (!system?.id) throw new Error("System folder not found");

        let promptsDir = await driveClient.findFolder('Agent_Prompts', system.id);
        if (!promptsDir) {
            promptsDir = await driveClient.createFolder('Agent_Prompts', system.id);
        }
        return promptsDir.id!;
    }

    async getPrompt(agentId: string): Promise<string> {
        const agent = AGENT_REGISTRY.find(a => a.id === agentId);
        if (!agent) throw new Error("Agent not found");

        const folderId = await this.getPromptsFolderId();
        // DriveClient needs a findFile method distinct from findFolder or we filter listFiles
        const files = await driveClient.listFiles(folderId);
        const file = files.find(f => f.name === `${agent.name}.txt`);

        if (file) {
            // Read content
            return await driveClient.getFileContent(file.id!) as string;
        } else {
            // Create default from registry description
            const defaultPrompt = `You are ${agent.name}. Role: ${agent.role}.\n\nContext:\n${agent.description}`;
            await driveClient.createFile(`${agent.name}.txt`, defaultPrompt, 'text/plain', folderId);
            return defaultPrompt;
        }
    }

    async savePrompt(agentId: string, content: string): Promise<void> {
        const agent = AGENT_REGISTRY.find(a => a.id === agentId);
        if (!agent) throw new Error("Agent not found");

        const folderId = await this.getPromptsFolderId();
        const files = await driveClient.listFiles(folderId);
        const file = files.find(f => f.name === `${agent.name}.txt`);

        if (file) {
            await driveClient.updateFile(file.id!, content, 'text/plain');
        } else {
            await driveClient.createFile(`${agent.name}.txt`, content, 'text/plain', folderId);
        }
    }
}

export const promptService = new PromptService();
