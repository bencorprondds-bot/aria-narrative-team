import { driveClient } from './drive';

const FOLDER_STRUCTURE = {
    name: 'Life with AI',
    children: [
        {
            name: '00_System',
            children: [
                { name: 'Agent_Prompts' },
                { name: 'Reference_Docs' },
                { name: 'Style_Preferences' },
                { name: 'Learning' },
                { name: 'Workflows' },
            ]
        },
        { name: '01_Inbox' },
        { name: '02_In_Development' },
        { name: '03_Ready_for_Review' },
        { name: '04_Published' },
        { name: '05_Voice_Library' },
    ]
};

export class FolderManager {
    async ensureStructure() {
        const logs: string[] = [];
        try {
            const rootId = await this.ensureFolder(FOLDER_STRUCTURE.name);
            logs.push(`Root folder '${FOLDER_STRUCTURE.name}' ID: ${rootId}`);

            if (FOLDER_STRUCTURE.children) {
                for (const child of FOLDER_STRUCTURE.children) {
                    await this.processNode(child, rootId, logs);
                }
            }
            return { success: true, logs };
        } catch (error: any) {
            console.error(error);
            return { success: false, logs, error: error.message };
        }
    }

    private async processNode(node: any, parentId: string, logs: string[]) {
        const folderId = await this.ensureFolder(node.name, parentId);
        logs.push(`Verified '${node.name}'`);

        if (node.children) {
            for (const child of node.children) {
                await this.processNode(child, folderId, logs);
            }
        }
    }

    private async ensureFolder(name: string, parentId?: string): Promise<string> {
        const existing = await driveClient.findFolder(name, parentId);
        if (existing) {
            return existing.id!;
        }
        const created = await driveClient.createFolder(name, parentId);
        return created.id!;
    }
}

export const folderManager = new FolderManager();
