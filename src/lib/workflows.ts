import { driveClient } from './drive';
import { Node, Edge } from 'reactflow';

export interface WorkflowDefinition {
    id: string; // Drive File ID
    name: string;
    nodes: Node[];
    edges: Edge[];
    lastModified: number;
}

export class WorkflowService {
    private async getWorkflowsFolderId() {
        // Helper to find path: Life with AI -> 00_System -> Workflows
        const root = await driveClient.findFolder('Life with AI');
        if (!root?.id) throw new Error("Root folder 'Life with AI' not found. Run setup first.");

        const system = await driveClient.findFolder('00_System', root.id);
        if (!system?.id) throw new Error("'00_System' folder not found.");

        let workflowsDir = await driveClient.findFolder('Workflows', system.id);
        if (!workflowsDir) {
            workflowsDir = await driveClient.createFolder('Workflows', system.id);
        }
        return workflowsDir.id!;
    }

    async listWorkflows(): Promise<{ id: string, name: string }[]> {
        const parentId = await this.getWorkflowsFolderId();
        console.log(`[WorkflowService] Workflows Folder ID: ${parentId}`);

        const files = await driveClient.listFiles(parentId);
        console.log(`[WorkflowService] Raw Files Found: ${files.length}`);
        files.forEach(f => console.log(` - File: ${f.name} (${f.mimeType})`));

        // Filter out non-json if necessary, though folder should only contain workflows
        return files
            .filter(f => !f.mimeType?.includes('folder')) // exclude folders
            .map(f => ({
                id: f.id!,
                name: f.name!.replace('.json', '')
            }));
    }

    async getWorkflow(fileId: string): Promise<WorkflowDefinition> {
        const data = await driveClient.getFileContent(fileId);
        // Drive returns object directly if json
        const workflow = typeof data === 'string' ? JSON.parse(data) : data;
        return { ...workflow, id: fileId };
    }

    async createWorkflow(name: string, nodes: Node[], edges: Edge[]) {
        const parentId = await this.getWorkflowsFolderId();
        const workflow = {
            name,
            nodes,
            edges,
            lastModified: Date.now()
        };
        const fileName = `${name}.json`;

        // Check if exists to avoid duplicates? Simple version: just create new
        const file = await driveClient.createFile(fileName, JSON.stringify(workflow), 'application/json', parentId);
        return { ...workflow, id: file.id };
    }

    async updateWorkflow(fileId: string, workflow: Partial<WorkflowDefinition>) {
        // First get existing to merge? Or just overwrite.
        // For speed, let's assume client sends full state usually.
        // If we only have partial, fetch first.

        let fullWorkflow = workflow;
        if (!workflow.nodes || !workflow.edges) {
            const existing = await this.getWorkflow(fileId);
            fullWorkflow = { ...existing, ...workflow };
        }

        await driveClient.updateFile(fileId, JSON.stringify(fullWorkflow), 'application/json');
        return fullWorkflow;
    }
}

export const workflowService = new WorkflowService();
