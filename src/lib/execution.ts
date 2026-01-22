import { workflowService } from './workflows';
import { promptService } from './prompts';
import { geminiClient } from './gemini';
import { Node, Edge } from 'reactflow';

interface ExecutionLog {
    nodeId: string;
    agentName: string;
    input: string;
    output: string;
    timestamp: number;
}

export class ExecutionService {
    private MAX_LOOPS = 3;

    async executeWorkflow(workflowId: string, initialInput: string) {
        // 1. Load Workflow
        const workflow = await workflowService.getWorkflow(workflowId);
        if (!workflow) throw new Error("Workflow not found");

        const logs: ExecutionLog[] = [];
        const visitCounts: Record<string, number> = {};

        // 2. Find Start Node
        // Logic:
        // A. Look for specific 'trigger' role.
        // B. Look for 'Inbox' label.
        // C. Fallback: Indegree 0 (only works for acyclic graphs).

        let startNodes = workflow.nodes.filter(n => n.data.role === 'trigger');

        if (startNodes.length === 0) {
            startNodes = workflow.nodes.filter(n => n.data.label === 'Inbox');
        }

        if (startNodes.length === 0) {
            const incomingEdges = new Set(workflow.edges.map(e => e.target));
            startNodes = workflow.nodes.filter(n => !incomingEdges.has(n.id));
        }

        if (startNodes.length === 0) {
            // If still empty (e.g. pure cycle with no trigger), just pick the first node as a fallback?
            // Or throw error.
            throw new Error("Could not find a Start Node (Inbox). Please add an Inbox node.");
        }

        console.log("Starting execution with nodes:", startNodes.map(n => n.data.label));

        // Queue: { nodeId, inputContext }
        const queue: { nodeId: string, input: string }[] = startNodes.map(n => ({
            nodeId: n.id,
            input: initialInput
        }));

        const finalOutputs: string[] = [];

        // 3. Execution Loop
        while (queue.length > 0) {
            const { nodeId, input } = queue.shift()!;

            // Loop Safety Check
            visitCounts[nodeId] = (visitCounts[nodeId] || 0) + 1;
            if (visitCounts[nodeId] > this.MAX_LOOPS) {
                console.warn(`Loop limit reached for node ${nodeId}. Skipping.`);
                continue;
            }

            const node = workflow.nodes.find(n => n.id === nodeId)!;

            // Skip 'Inbox' trigger nodes if they are just placeholders, 
            // OR execute them if they are agents.
            // If role is 'trigger', we just pass input through?
            // Let's assume all nodes in this graph (except maybe Inbox?) are agents.
            // If label is Inbox, we might just pass through.

            let output = input;

            // If it's an Agent (has agentId logic), run Gemini
            // We need to map node -> agentId. 
            // In our node data, we have `label` (name) and `role`. 
            // Ideally we stored the `agentId` in data too. 
            // Let's rely on name matching for now or update the node data model later.
            // Using `label` as Agent Name.

            if (node.data.role !== 'trigger') {
                // Fetch Persisted Prompt
                // We need to know the Agent ID. 
                // Current Node Data: { label: "Viktor", role: "specialist" ... }
                // We can lookup agent by name in registry or just trust the label name matches the prompt file.
                // ExecutionService should use the name to find the prompt.

                // However, PromptService takes an ID. 
                // Let's assume we can lookup ID from registry by Name.
                // Or better, update Editor to save agentId in node data. 
                // Retroactive fix: we used `agent.id` as part of `node.id` (e.g. `viktor_123`).
                // We can extract it? Or just search registry by name.

                const systemPrompt = await this.getSystemPrompt(node.data.label);

                // Resolve Tools
                const { TOOL_REGISTRY } = require('./tools');
                const nodeTools = (node.data.tools || []).map((toolId: string) =>
                    TOOL_REGISTRY.find((t: any) => t.id === toolId)
                ).filter(Boolean);

                if (nodeTools.length > 0) {
                    console.log(`[Execution] Node ${node.data.label} has tools:`, nodeTools.map((t: any) => t.name));
                }

                // Run Gemini
                // output = await geminiClient.chat(input, systemPrompt); // OLD
                output = await geminiClient.chat(input, systemPrompt, nodeTools); // NEW

                // Log
                logs.push({
                    nodeId,
                    agentName: node.data.label,
                    input,
                    output,
                    timestamp: Date.now()
                });

                // Check for "APPROVED" override
                if (output.trim().toUpperCase().startsWith("APPROVED")) {
                    finalOutputs.push(output);
                    continue; // Stop this branch
                }
            } else {
                // Trigger Node - Log it directly so user sees the input start
                logs.push({
                    nodeId,
                    agentName: node.data.label, // "Inbox" usually
                    input: "Workflow Started",
                    output: input, // The actual input becomes the output of the trigger
                    timestamp: Date.now()
                });
            }

            // Find Next Nodes
            const outgoingParam = workflow.edges.filter(e => e.source === nodeId);

            // Capture output if:
            // 1. It's a leaf node (no outgoing edges)
            // 2. It's explicitly marked as an End Node (isEnd == true)
            // 3. It said "APPROVED"
            if (outgoingParam.length === 0 || node.data.isEnd) {
                finalOutputs.push(`${node.data.label}: ${output}`);
            }

            // Continue traversing unless it's a leaf
            // (If it's an End Node, we MIGHT want to stop this branch, or continue? 
            // Usually "Termination Node" implies stopping. Let's stop.)
            if (node.data.isEnd) {
                continue;
            }

            if (outgoingParam.length > 0) {
                for (const edge of outgoingParam) {
                    queue.push({ nodeId: edge.target, input: output });
                }
            }
        }

        // 4. Notification (Mock)
        if (finalOutputs.length > 0) {
            console.log("WORKFLOW FINISHED. Notification sent.");
            // mock email logic here
        }

        return { logs, finalOutputs };
    }

    private async getSystemPrompt(agentName: string) {
        // Quick lookup wrapper. Real app should store IDs in nodes.
        const { AGENT_REGISTRY } = require('./agents');
        const agent = AGENT_REGISTRY.find((a: any) => a.name === agentName);
        if (agent) {
            return await promptService.getPrompt(agent.id);
        }
        return `You are ${agentName}. Process the input.`;
    }
}

export const executionService = new ExecutionService();
